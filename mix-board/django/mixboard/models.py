from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.http import HttpResponse

class UserProfile(models.Model):
  user = models.OneToOneField(User)

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)

class Song(models.Model):
  owner = models.ForeignKey(User)
  name  = models.CharField(max_length=60)
  data  = models.TextField()

  def __unicode__(self):
    return self.owner.username + " - " + self.name
