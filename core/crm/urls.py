from django.urls import path, include, re_path
from .views import LoginView, client_list, ApplicationsView


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='custom-login'),
    path('clients/', client_list, name='client_list'),
    re_path(r'^api/v1/applications/?$', ApplicationsView.as_view(), name='applications-list')
]