from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.http import HttpResponse
from mixboard.main import markdownify
import logging

logger = logging.getLogger()

class MarkdownField(models.TextField):

  description = 'The Markdown-filtered value of another TextField'

  def __init__(self, raw_field, *args, **kwargs):
    self.raw_field = raw_field
    super(models.TextField, self).__init__(*args, **kwargs)

  def pre_save(self, instance, add):
    val = markdownify(getattr(instance, self.raw_field.attname))
    setattr(instance, self.attname, val)
    return val

class UserProfile(models.Model):
  user         = models.OneToOneField(User)
  bio          = models.TextField()
  bio_markdown = MarkdownField(bio)

  def total_votes(self):
    songs = Song.objects.filter(owner=self.user)
    votes = 0
    for s in songs:
      votes += s.vote_count
    return votes

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
  owner      = models.ForeignKey(User)
  name       = models.CharField(max_length=60)
  data       = models.TextField()
  vote_count = models.IntegerField()

  def __unicode__(self):
    return self.owner.username + " - " + self.name

class SongComment(models.Model):
  song     = models.ForeignKey(Song)
  author   = models.ForeignKey(User)
  created  = models.DateTimeField(auto_now_add=True)
  modified = models.DateTimeField(auto_now=True)
  text     = models.TextField()
  markdown = MarkdownField(text)

  def __unicode__(self):
    return self.author.username + " - " + self.song.name

  class Meta:
    ordering = ['-created']

from django.contrib.auth.signals import user_logged_in, user_logged_out

def logged_in(sender, user, request, **kwargs):
  logger.info('User %d (%s) logged in' % (user.id, user.username))

def logged_out(sender, user, request, **kwargs):
  if user is not None:
    logger.info('User %d (%s) logged out' % (user.id, user.username))

user_logged_in.connect(logged_in)
user_logged_out.connect(logged_out)
