from django.urls import path
from .views import login_view, client_list

urlpatterns = [
    path('login/', login_view, name='login'),
    path('clients/', client_list, name='client_list'),
]