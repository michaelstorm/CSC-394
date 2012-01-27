from django.contrib.auth.models import User
from django.db import models
from django.http import HttpResponse
from mixboard.main import serveStatic

class UserProfile(models.Model):
    # This field is required.
    user = models.OneToOneField(User)

def login(request):
  return serveStatic(request, 'login.html')
