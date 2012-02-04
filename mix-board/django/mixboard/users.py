from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.db import models
from django.http import HttpResponse
from mixboard.main import serveStatic

class UserProfile(models.Model):
    # This field is required.
    user = models.OneToOneField(User)
    def __unicode__(self):
        return self.username

def login(request):
    if request.method == 'POST': 
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                return HttpResponse('success')
            else:
                return HttpResponse('inactive')
        else:
            return HttpResponse('invalid')

    return serveStatic(request, 'login.html')
        

def logout(request):
  auth_logout(request)
  return HttpResponse()

def signup(request):
    if request.method == 'POST': 
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']
      
        try:
        #create user, check database for name 
            user = User.objects.create_user(username, email, password)
        except Exception as e:
            return HttpResponse('exists')
       
        
        return HttpResponse('success')
    return serveStatic(request, 'signup.html')

