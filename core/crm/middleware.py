from loguru import logger

class LoguruAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        logger.info(
            f"{request.method} {request.get_full_path()} "
            f"status={response.status_code} user={request.user if request.user.is_authenticated else 'anon'}"
        )
        return response
