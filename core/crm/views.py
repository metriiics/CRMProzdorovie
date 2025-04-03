from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.core.paginator import Paginator
from .models import Client
from django.db.models import Q

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
    else:
        form = AuthenticationForm()
    
    return render(request, 'login.html', {'form': form})


def client_list(request):
    clients = Client.objects.all()
    
    # Универсальный поиск по всем полям (кроме даты)
    search_query = request.GET.get('search', '')
    if search_query:
        clients = clients.filter(
            Q(last_name__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(surname__icontains=search_query) |
            Q(phone_number__icontains=search_query)
        )
    
    # Пагинация
    paginator = Paginator(clients, 30)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,  # Передаём поисковый запрос в шаблон
    }
    return render(request, 'client_list.html', context)