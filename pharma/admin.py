from django.contrib import admin, messages
from django.db import transaction
from django.utils import timezone
from .models import Product, Order, OrderItem, Category


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["productID", "name", "price", "quantity"]
    search_fields = ["name"]
    list_filter = ["quantity"]

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    fields = [
        "quantity",
        "unit_price",
        "subtotal",
    ]

    readonly_fields = [
        "quantity",
        "unit_price",
        "subtotal",
    ]

    can_delete = False

    @admin.display(description="Totale")
    def subtotal(self, obj):
        if obj.unit_price is None or obj.quantity is None:
            return "—"
    
        return f"{obj.unit_price * obj.quantity:.2f} €"

@admin.action(description="Conferma incasso contanti e aggiorna scorte")
def confirm_cash_payment(modeladmin, request, queryset):

    for selected_order in queryset:

        try:
            with transaction.atomic():

                order = Order.objects.select_for_update().get(
                    pk=selected_order.pk
                )

                if order.status != "pending":
                    raise ValueError("L'ordine non è in attesa di pagamento.")

                if order.payment_method != "contanti":
                    raise ValueError("L'ordine non prevede pagamento in contanti.")

                products_to_update = []

                # Verifica disponibilità prodotti
                for item in order.items.all():

                    product = Product.objects.select_for_update().get(
                        pk=item.product_id
                    )

                    if item.quantity > product.quantity:
                        raise ValueError(
                            f"{product.name}: disponibilità insufficiente. "
                            f"Disponibili: {product.quantity}."
                        )

                    products_to_update.append(
                        (product, item.quantity)
                    )

                # Aggiorna le scorte
                for product, quantity in products_to_update:
                    product.quantity -= quantity
                    product.save(update_fields=["quantity"])

                # Conferma incasso
                order.status = "paid"
                order.paid_at = timezone.now()
                order.transaction_id = f"CASH-{order.id:06d}"

                order.save(
                    update_fields=[
                        "status",
                        "paid_at",
                        "transaction_id",
                    ]
                )

            messages.success(
                request,
                f"Incasso dell'ordine {order.id} registrato correttamente."
            )

        except ValueError as error:
            messages.error(
                request,
                f"Ordine {selected_order.id}: {error}"
            )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "customer_name",
        "customer_email",
        "delivery_method",
        "payment_method",
        "status",
        "total",
        "created_at",
    ]

    list_filter = ["status", "delivery_method", "payment_method", "created_at"]
    search_fields = ["customer_name", "customer_email"]
    
    readonly_fields = ["total", 
                        "created_at", 
                        "payment_method",
                        "card_last4",
                        "transaction_id",
                        "delivery_method",
                        "delivery_address",
                        "shipping_cost",
                        "created_at",
                        "paid_at"]

    inlines = [OrderItemInline]

    actions = [confirm_cash_payment]

