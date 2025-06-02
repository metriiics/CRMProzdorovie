from django.urls import path, include, re_path
from .views import (LoginView, ApplicationsView, SearchDoctorAPIView, SearchClientAPIView, 
                    ModalViewAddClient, ModalViewChangeClient, ModalViewChangeRecord, 
                    ModalViewCreateRecord, RecordDataAPIView, StatusSearchView,
                    EmployeeView, AnalyticsMoney, AnalyticsCall, ModalViewAddEmployee, ModalViewEditEmployee,
                    Records, ModalViewShowRecord, EmployeeDetailAPIView)

from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('api/v1/applications/', ApplicationsView.as_view(), name='applications-list'), 
    path('search-doctor/', SearchDoctorAPIView.as_view(), name='search_doctor'),
    path('search-client/', SearchClientAPIView.as_view(), name='search-client'),
    path('api/record-data/', RecordDataAPIView.as_view(), name='record_data_api'),
    path('api/status-search/', StatusSearchView.as_view(), name='status_search_api'),
    path('modal/add-client/', ModalViewAddClient.as_view(), name='add_client_modal'),
    path('modal/change-client/', ModalViewChangeClient.as_view(), name='change_client_modal'),
    path('modal/change-record/', ModalViewChangeRecord.as_view(), name='change_record_modal'),
    path('modal/create-record/', ModalViewCreateRecord.as_view(), name='create_record_modal'),
    path('api/v1/employee', EmployeeView.as_view(), name='employee-list'),
    path('api/v1/analytics-call', AnalyticsCall.as_view(), name='analytics_call'),
    path('api/v1/analytics-money', AnalyticsMoney.as_view(), name='analytics_money'),
    path('modal/add-employee/', ModalViewAddEmployee.as_view(), name='add_employee_modal'),
    path('modal/edit-employee/', ModalViewEditEmployee.as_view(), name='change_employee_modal'),
    path('modal/show-record/', ModalViewShowRecord.as_view(), name='show_record'),
    path('api/v1/records/', Records.as_view(), name='records'),
    path('api/v1/employee-data/', EmployeeDetailAPIView.as_view(), name='employee-data-api'),
]


