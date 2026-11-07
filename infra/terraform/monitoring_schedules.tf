# Scheduled jobs (jobs.tf) that stopped succeeding: paused by mistake, deleted, Scheduler down, or
# failing every time. monitoring.tf's alert only sees a run that was tried and failed, so this one
# counts successes and fires on their absence. By groups, not per job, so conditions stay few.

# Every run Cloud Scheduler saw succeed; a failed attempt logs at ERROR.
resource "google_logging_metric" "schedule_succeeded" {
  name   = "testee_schedule_succeeded"
  filter = "resource.type=\"cloud_scheduler_job\" AND jsonPayload.\"@type\"=\"type.googleapis.com/google.cloud.scheduler.logging.AttemptFinished\" AND severity<ERROR"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
  }
}

locals {
  # Jobs that run at least daily and aren't paused. A weekly job is left out: its window would be
  # longer than an alert can look back, so only its failed runs alert.
  watched_schedules = {
    for name, job in local.schedules : name => job
    if endswith(job.cron, " * * *") && !contains(local.paused_schedules, name)
  }

  # What loses money, a deletion or events when it stops pages; the rest is a ticket.
  paged_schedules = [
    for name in keys(local.watched_schedules) : name
    if contains(["erasures", "invite-expiry", "billing-reconcile", "sign-in-backup"], name) || endswith(name, "-outbox")
  ]

  # Hourly-or-faster jobs: no success in 30 minutes, long enough that one failed run of a 10-minute
  # job isn't silence. The rest: none in a day, for an hour so a run's own delay doesn't count.
  schedule_silences = {
    frequent-page   = { frequent = true, page = true }
    frequent-ticket = { frequent = true, page = false }
    daily-page      = { frequent = false, page = true }
    daily-ticket    = { frequent = false, page = false }
  }
}

resource "google_monitoring_alert_policy" "schedule_silent" {
  for_each     = local.schedule_silences
  display_name = "testee scheduled job didn't run (${each.key})"
  combiner     = "OR"
  severity     = each.value.page ? "CRITICAL" : "WARNING"

  conditions {
    display_name = each.value.frequent ? "A frequent job had no successful run in 30 minutes" : "A daily job had no successful run in a day"

    condition_threshold {
      filter = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.schedule_succeeded.name}\" AND resource.type=\"cloud_scheduler_job\" AND resource.label.job_id = one_of(${join(", ", [
        for name, job in local.watched_schedules : "\"${name}\""
        if endswith(job.cron, " * * * *") == each.value.frequent && contains(local.paged_schedules, name) == each.value.page
      ])})"
      comparison              = "COMPARISON_LT"
      threshold_value         = 1
      duration                = each.value.frequent ? "300s" : "3600s"
      evaluation_missing_data = "EVALUATION_MISSING_DATA_ACTIVE"

      aggregations {
        alignment_period     = each.value.frequent ? "1800s" : "86400s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.job_id"]
      }

      trigger {
        count = 1
      }
    }
  }

  alert_strategy {
    auto_close = "86400s"
  }

  documentation {
    content   = "A scheduled job has stopped succeeding; the alert names the job. Check whether it is paused or missing, and its last attempts."
    mime_type = "text/markdown"

    links {
      display_name = "Runbook: a scheduled job didn't run"
      url          = "${local.runbooks}/platform.md#a-scheduled-job-didnt-run"
    }
  }

  notification_channels = each.value.page ? local.page_channels : local.ticket_channels
}
