from django.contrib import admin
from .models import GirlProfile, GuyProfile, ChatRoom, Message

@admin.register(GirlProfile)
class GirlProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'location', 'category', 'is_verified', 'is_online')
    list_filter = ('is_verified', 'category', 'is_online')
    search_fields = ('name', 'location')

@admin.register(GuyProfile)
class GuyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_vip', 'vip_expires', 'icebreakers_remaining')
    list_filter = ('is_vip',)

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('guy', 'girl', 'created_at')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('room', 'sender', 'text', 'is_icebreaker', 'timestamp')
    list_filter = ('is_icebreaker',)