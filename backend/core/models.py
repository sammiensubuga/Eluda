from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class GirlProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    age = models.IntegerField()
    location = models.CharField(max_length=100)
    category = models.CharField(max_length=20, default='Dating') # Hookup, Dating, Marriage, Friends
    is_verified = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}, {self.age}"

class GuyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_vip = models.BooleanField(default=False)
    vip_expires = models.DateTimeField(null=True, blank=True)
    icebreakers_remaining = models.IntegerField(default=15)
    last_reset_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - VIP: {self.is_vip}"

class ChatRoom(models.Model):
    guy = models.ForeignKey(GuyProfile, on_delete=models.CASCADE)
    girl = models.ForeignKey(GirlProfile, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    is_icebreaker = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)