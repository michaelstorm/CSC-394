from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.http import HttpResponse

class UserProfile(models.Model):
  user = models.OneToOneField(User)
  bio  = models.TextField()

  def __unicode__(self):
    return self.user.username + "'s profile"

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)

for user in User.objects.all():
  if len(UserProfile.objects.filter(user=user)) == 0:
    UserProfile.objects.create(user=user, bio='')

class Song(models.Model):
  owner = models.ForeignKey(User)
  name  = models.CharField(max_length=60)
  data  = models.TextField()
  vote_count = models.IntegerField()

  def __unicode__(self):
    return self.owner.username + " - " + self.name

class SongComment(models.Model):
  song = models.ForeignKey(Song)
  author = models.ForeignKey(User)
  created = models.DateTimeField(auto_now_add=True)
  modified = models.DateTimeField(auto_now=True)
  text = models.TextField()

  def __unicode__(self):
    return self.author.username + " - " + self.song.name

  class Meta:
    ordering = ['-created']
