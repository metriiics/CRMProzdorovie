from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import status
from .models import Client, Application, Comment
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch
from .serializers import CombineSerializer
from rest_framework.pagination import PageNumberPagination

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

class ApplicationsView(APIView):
    pagination_class = StandartPagination

    def get(self, request):
        try:
            queryset = Application.objects.select_related(
                'client',
                'status',
                'doctor',
                'doctor__user',
            ).prefetch_related(Prefetch(
                'comments', queryset=Comment.objects.select_related('manager')
            )).order_by('-id')
            
            paginator = self.pagination_class()
            paginator_page = paginator.paginate_queryset(queryset, request)
            serializer = CombineSerializer(paginator_page, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=400
            )