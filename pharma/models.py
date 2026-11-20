
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
            return self.name

    
class Product(models.Model):

    productID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    desc = models.CharField(max_length=255)
    allergies_desc = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    expiry_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to="", blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        null = True,
        blank=True,
        related_name="products"
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]

class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "In attesa di pagamento"),
        ("paid", "Pagato"),
    ]

    DELIVERY_CHOICES = [
    ("home", "Spedizione a domicilio"),
    ("pickup", "Ritiro in farmacia"),
    ]

    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)

    delivery_method = models.CharField(
    max_length=10,
    choices=DELIVERY_CHOICES,
    default="pickup"
    )

    delivery_address = models.TextField(blank=True)

    shipping_cost = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(max_length=50, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True)
    transaction_id = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ordine {self.id} - {self.customer_name}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
