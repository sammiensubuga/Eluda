from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import GirlProfile
from .serializers import GirlProfileSerializer

@api_view(['GET'])
def get_girls(request):
    # Get all verified girls from the database
    girls = GirlProfile.objects.filter(is_verified=True)
    serializer = GirlProfileSerializer(girls, many=True)
    return Response(serializer.data)