"""A sign-in account as the daily backup stores it, and back. Accounts sign in with Google,
GitHub, LinkedIn or a guest token, so there are no passwords to keep."""

from firebase_admin import auth as firebase_auth


def stored(account: firebase_auth.ExportedUserRecord) -> dict:
    return {
        "uid": account.uid,
        "email": account.email,
        "email_verified": account.email_verified,
        "display_name": account.display_name,
        "photo_url": account.photo_url,
        "disabled": account.disabled,
        "custom_claims": account.custom_claims,
        "created": account.user_metadata.creation_timestamp,
        "last_sign_in": account.user_metadata.last_sign_in_timestamp,
        "providers": [
            {
                "uid": provider.uid,
                "provider_id": provider.provider_id,
                "email": provider.email,
                "display_name": provider.display_name,
                "photo_url": provider.photo_url,
            }
            for provider in account.provider_data
        ],
    }


def imported(saved: dict) -> firebase_auth.ImportUserRecord:
    return firebase_auth.ImportUserRecord(
        uid=saved["uid"],
        email=saved["email"],
        email_verified=saved["email_verified"],
        display_name=saved["display_name"],
        photo_url=saved["photo_url"],
        disabled=saved["disabled"],
        custom_claims=saved["custom_claims"],
        user_metadata=firebase_auth.UserMetadata(saved["created"], saved["last_sign_in"]),
        provider_data=[firebase_auth.UserProvider(**provider) for provider in saved["providers"]],
    )
