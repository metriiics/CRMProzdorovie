from django.urls import path, include, re_path
from .views import LoginView, client_list, ApplicationsView, SearchDoctorAPIView, SearchClientAPIView, ModalViewAddClient, ModalViewChangeClient, ModalViewChangeRecord, ModalViewCreateRecord
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('clients/', client_list, name='client_list'),
    path('api/v1/applications/', ApplicationsView.as_view(), name='applications-list'), 
    path('search-doctor/', SearchDoctorAPIView.as_view(), name='search_doctor'),
    path('search-client/', SearchClientAPIView.as_view(), name='search-client'),
    path('modal/add-client/', ModalViewAddClient.as_view(), name='add_client_modal'),
    path('modal/change-client/', ModalViewChangeClient.as_view(), name='change_client_modal'),
    path('modal/change-record/', ModalViewChangeRecord.as_view(), name='change_record_modal'),
    path('modal/create-record/', ModalViewCreateRecord.as_view(), name='create_record_modal'),
]


