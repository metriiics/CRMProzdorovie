from django.urls import path, include
from .views import LoginView, ClientAPIView


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='custom-login'),
    path('clients/', ClientAPIView.as_view(), name='client-list'),
]