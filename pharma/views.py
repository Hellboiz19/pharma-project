
import re
from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from .models import Product, Order, OrderItem,Category
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderCreateSerializer,
    OrderSerializer,
)


class ProductList(ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

@api_view(["GET"])
def CategoryList(request):
    categories = Category.objects.all().order_by("name")

    serializer = CategorySerializer(
        categories,
        many=True
    )

    return Response(serializer.data)

class OrderCreate(APIView):
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        quantities = {}

        for row in data["items"]:
            pid = row["productID"]
            quantities[pid] = quantities.get(pid, 0) + row["quantity"]

        products = Product.objects.in_bulk(list(quantities.keys()))

        errors = []

        for pid, qty in quantities.items():
            product = products.get(pid)

            if product is None:
                errors.append(f"Prodotto {pid} non trovato.")

            elif qty > product.quantity:
                errors.append(
                    f"{product.name}: disponibili solo "
                    f"{product.quantity} pezzi."
                )

        if errors:
            return Response({"errors": errors}, status=400)

        with transaction.atomic():
            order = Order.objects.create(
                customer_name=data["customer_name"],
                customer_email=data["customer_email"],
                customer_phone=data["customer_phone"],
            )

            total = Decimal("0")

            for pid, qty in quantities.items():
                product = products[pid]

                OrderItem.objects.create(
                    order=order,
                   product=product,
                    
                    unit_price=product.price,
                    quantity=qty,
                )

                total += product.price * qty

            order.total = total
            order.save()

        return Response(
            OrderSerializer(order).data,
            status=201
        )


class OrderPay(APIView):

    def post(self, request, pk):

        # Recupero i dati della carta
        card_number = str(
            request.data.get("card_number", "")
        ).replace(" ", "")

        expiry = str(request.data.get("expiry", ""))
        cvv = str(request.data.get("cvv", ""))

        # Controllo numero carta: esattamente 16 cifre
        if not (card_number.isdigit() and len(card_number) == 16):
            return Response(
                {"error": "Il numero della carta deve contenere 16 cifre."},
                status=400
            )

        # Controllo scadenza: formato MM/AA
        if not re.fullmatch(r"(0[1-9]|1[0-2])/\d{2}", expiry):
            return Response(
                {"error": "Scadenza non valida. Usa il formato MM/AA."},
                status=400
            )

        # Controllo CVV: esattamente 3 cifre
        if not (cvv.isdigit() and len(cvv) == 3):
            return Response(
                {"error": "Il CVV deve contenere 3 cifre."},
                status=400
            )

        with transaction.atomic():

            order = get_object_or_404(
                Order.objects.select_for_update(),
                pk=pk
            )

            # Evito di pagare due volte lo stesso ordine
            if order.status == "paid":
                return Response(
                    {"error": "Questo ordine è già stato pagato."},
                    status=400
                )

            to_update = []

            # Controllo nuovamente la disponibilità dei prodotti
            for item in order.items.all():

                product = Product.objects.select_for_update().get(
                    pk=item.product_id
                )

                if item.quantity > product.quantity:
                    return Response(
                        {
                            "error": (
                                f"{item.name} non è più "
                                "disponibile nella quantità richiesta."
                            )
                        },
                        status=409
                    )

                to_update.append((product, item.quantity))

            # Aggiorno le quantità del magazzino
            for product, qty in to_update:
                product.quantity -= qty
                product.save()

            # Confermo il pagamento simulato
            order.status = "paid"
            order.payment_method = "carta (simulata)"
            order.card_last4 = card_number[-4:]
            order.transaction_id = f"SIM-{order.id:06d}"
            order.paid_at = timezone.now()

            order.save()

            return Response(
                OrderSerializer(order).data
            )
