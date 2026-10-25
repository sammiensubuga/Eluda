from rest_framework import serializers
from .models import GirlProfile, GuyProfile, Message, ChatRoom

class GirlProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GirlProfile
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'