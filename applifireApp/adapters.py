from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        email = sociallogin.account.extra_data.get('email')

        if email and not sociallogin.is_existing:
            try:
                user = User.objects.get(email=email)
                sociallogin.connect(request, user)
                print(f"🔗 adpted this google user to exsiting user: {email}")

            except User.DoesNotExist:
                print(f"🔍 not found user with mail: {email} to adapt him")
                pass
