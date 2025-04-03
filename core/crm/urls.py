from django.urls import path, include
from .views import LoginView, client_list


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='custom-login'),
    path('clients/', client_list, name='client_list'),

]