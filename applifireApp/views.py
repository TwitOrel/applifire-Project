import os
from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse

def send_test_email(request):
    subject = "מייל בדיקה מ-Django"
    message = "היי, זה מייל שנשלח מ-Django כדי לוודא שהכל עובד!"
    from_email = os.getenv("EMAIL.HOST_USER")
    recipient_list = ["oreltwito3@gmail.com"]  # שלח לעצמך

    send_mail(subject, message, from_email, recipient_list)
    return HttpResponse("מייל נשלח בהצלחה!")


def home(request):
    return HttpResponse("<h1>ברוך הבא לאתר!</h1>")
