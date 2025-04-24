from django.urls import path, include, re_path
from .views import LoginView, client_list, ApplicationsView, respHome, SearchDoctorAPIView, SearchClientAPIView, StatusListAPIView, NewApplicationsView


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='custom-login'),
    path('clients/', client_list, name='client_list'),
    path('api/v1/applications/', ApplicationsView.as_view(), name='applications-list'), 
    path('search-doctor/', SearchDoctorAPIView.as_view(), name='search_doctor'),
    path('search-client/', SearchClientAPIView.as_view(), name='search-client'),
    path('api/status/', StatusListAPIView.as_view(), name='status-list'),
    path('home', respHome, name=''),
    path('homie', NewApplicationsView.as_view(), name='homie')
]