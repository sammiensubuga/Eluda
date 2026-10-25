from django.urls import path
from . import views

urlpatterns = [
    path('girls/', views.get_girls, name='get_girls'),
]