from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import status
from .models import Client, Application, Comment, Doctor, Status
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch
from .serializers import CombineSerializer, ClientSerializer, StatusSerializer
from rest_framework.pagination import PageNumberPagination
from django.views import View

class LoginView(APIView):
    def get(self, request):
        return render(request, 'crm/home.html')
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    

def client_list(request):
    clients = Client.objects.all()
    
    search_query = request.GET.get('search')
    if search_query:
        clients = clients.filter(
            Q(last_name__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(surname__icontains=search_query) |
            Q(phone_number__icontains=search_query)
        )
    

    paginator = Paginator(clients, 30)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query, 
    }
    return render(request, 'crm/clients_list.html', context)

class StandartPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

class ApplicationsView(View):
    def get(self, request):
        queryset = Application.objects.select_related(
            'client',
            'status',
            'doctor',
            'doctor__user',
        ).prefetch_related(
            Prefetch(
                'comments', 
                queryset=Comment.objects.select_related('manager')
        )).order_by('id')
        
        return render(request, 'crm/index.html', {'applications': queryset})
        
#поиска врача
class SearchDoctorAPIView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        if query:
            doctors = Doctor.objects.filter(
                user__first_name__icontains=query
            ) | Doctor.objects.filter(
                user__last_name__icontains=query
            )
            doctors_list = [
                {'id': doctor.id, 'fio': f"{doctor.user.last_name} {doctor.user.first_name} {doctor.user.surname}"}
                for doctor in doctors
            ]
            return Response({'doctors': doctors_list})
        return Response({'doctors': []})
#поиска клиента
class SearchClientAPIView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')

        if not query:
            return Response({'clients': []})

        clients = Client.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(surname__icontains=query)
        )

        serializer = ClientSerializer(clients, many=True)
        return Response({'clients': serializer.data}, status=status.HTTP_200_OK)
    
class StatusListAPIView(APIView):
    def get(self, request):

        statuses = Status.objects.all()
        serializer = StatusSerializer(statuses, many=True)
        return Response({'statuses': serializer.data}, status=status.HTTP_200_OK)

def respHome(request):
    return render(request, "crm/login.html")


class NewApplicationsView(View):
    def get(self, request):

        # Получаем параметры сортировки из GET-запроса
        sort_field = request.GET.get('sort', 'id')
        sort_direction = request.GET.get('dir', 'asc')
        
        # Определяем порядок сортировки
        if sort_direction == 'desc':
            sort_field = f'-{sort_field}'

        queryset = Application.objects.select_related(
            'client',
            'status',
            'doctor',
            'doctor__user',
        ).prefetch_related(
            Prefetch(
                'comments', 
                queryset=Comment.objects.select_related('manager')
            )
        ).order_by(sort_field)
        
        paginator = Paginator(queryset, 30)  # Показывать 10 записей на странице
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        # Передаем параметры сортировки в контекст
        context = {
            'page_obj': page_obj,
            'current_sort': sort_field.lstrip('-'),
            'current_direction': sort_direction,
        }

        return render(request, 'crm/index.html', context)
    
class ModalViewAddClient(View):
    def get(self, request):
        return render(request, 'crm/add_client.html')
    
class ModalViewChangeClient(View):
    def get(self, request):
        return render(request, 'crm/change_client.html')
    
class ModalViewChangeRecord(View):
    def get(self, request):
        return render(request, 'crm/change_record.html')
    
class ModalViewCreateRecord(View):
    def get(self, request):
        return render(request, 'crm/create_record.html')

