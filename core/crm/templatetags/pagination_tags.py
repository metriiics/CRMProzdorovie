from django import template

register = template.Library()

@register.simple_tag
def pagination_url(request, page_number):
    params = request.GET.copy()
    if 'page' in params:
        params.pop('page')
    url = '?' + params.urlencode()
    if params:
        url += '&'
    url += 'page=' + str(page_number)
    return url