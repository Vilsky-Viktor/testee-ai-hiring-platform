"""The bucket the sign-in accounts' daily backup goes to (infra/terraform/sign_in_backup.tf)."""

from google.cloud import storage


def save(bucket: str, name: str, text: str) -> None:
    storage.Client().bucket(bucket).blob(name).upload_from_string(
        text, content_type="application/json"
    )
