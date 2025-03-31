from django.apps import AppConfig
class ApplifireappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'applifireApp'

    def ready(self):
        import applifireApp.signals
