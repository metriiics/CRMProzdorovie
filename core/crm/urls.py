from django.urls import path, include, re_path
from .views import LoginView, client_list, ApplicationsView, respHome, SearchDoctorAPIView, SearchClientAPIView, ModalViewAddClient, ModalViewChangeClient, ModalViewChangeRecord, ModalViewCreateRecord


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='custom-login'),
    path('clients/', client_list, name='client_list'),
    path('api/v1/applications/', ApplicationsView.as_view(), name='applications-list'), 
    path('search-doctor/', SearchDoctorAPIView.as_view(), name='search_doctor'),
    path('search-client/', SearchClientAPIView.as_view(), name='search-client'),
    path('api/v2/login/', respHome, name='login'),
    path('api/v1/applications/modal/add-client/', ModalViewAddClient.as_view(), name='add_client_modal'),
    path('api/v1/applications/modal/change-client/', ModalViewChangeClient.as_view(), name='change_client_modal'),
    path('api/v1/applications/modal/change-record/', ModalViewChangeRecord.as_view(), name='change_record_modal'),
    path('api/v1/applications/modal/create-record/', ModalViewCreateRecord.as_view(), name='create_record_modal'),
]