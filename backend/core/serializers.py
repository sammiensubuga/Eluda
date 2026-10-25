from rest_framework import serializers
from .models import GirlProfile, GuyProfile, Message, ChatRoom


class GirlProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GirlProfile
        fields = '__all__'


class GuyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuyProfile
        fields = '__all__'


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
