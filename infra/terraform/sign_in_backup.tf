# Sign-in accounts live only in Firebase, and every company's rows hang on their ids: the accounts
# service copies them here daily (jobs.tf). Versioned, and it may only add files, so neither a bug
# there nor a stolen token can remove what's kept. Holds emails: 14 days, as long as the database
# backups (the privacy policy's period), whether a file was replaced or not.
resource "google_storage_bucket" "sign_in_backup" {
  name                        = "${var.project_id}-sign-in-backup"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age        = 14
      with_state = "ANY"
    }

    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_storage_bucket_iam_member" "accounts_adds_sign_in_backups" {
  bucket = google_storage_bucket.sign_in_backup.name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${google_service_account.service["accounts"].email}"
}
