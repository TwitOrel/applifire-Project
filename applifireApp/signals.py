from django.db.models.signals import post_save
from allauth.socialaccount.signals import social_account_added, social_account_updated
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile = UserProfile.objects.create(user=instance)
        profile.generate_new_api_key()


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()


@receiver([social_account_added, social_account_updated])
def print_google_email(sender, request, sociallogin, **kwargs):
    email = sociallogin.account.extra_data.get('email')
    print("📧 Google mail:", email)


@receiver(user_signed_up)
def handle_new_social_user(request, user, **kwargs):
    socialaccount = user.socialaccount_set.first()
    if socialaccount:
        email = socialaccount.extra_data.get('email')
        print("📧 the mail who saved in new registrion:", email)


        # אופציונלי: לעדכן את user.email אם לא קיים
        if email and not user.email:
            user.email = email
            user.save()