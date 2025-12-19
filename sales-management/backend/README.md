# Sales Management Backend

Backend API for Sales Management System built with Java Vert.x and PostgreSQL.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE sales_management;
```

2. Update database configuration in `DatabaseConfig.java` or set environment variables:
   - `DB_HOST` (default: localhost)
   - `DB_PORT` (default: 5432)
   - `DB_NAME` (default: sales_management)
   - `DB_USER` (default: postgres)
   - `DB_PASSWORD` (default: postgres)
   - `DB_POOL_SIZE` (default: 10)

3. Run the migration script:
```bash
psql -U postgres -d sales_management -f src/main/resources/db/migration/001_create_tables.sql
```

Or manually execute the SQL file in your PostgreSQL client.

## Environment Variables

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: sales_management)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_POOL_SIZE` - Connection pool size (default: 10)
- `JWT_SECRET` - JWT secret key (default: your-secret-key-change-in-production)
- `HTTP_PORT` - HTTP server port (default: 8080)

## Building the Project

```bash
mvn clean package
```

This will create a fat JAR file in the `target` directory: `sales-management-backend-1.0.0-fat.jar`

## Running the Application

### Using Maven:
```bash
mvn exec:java -Dexec.mainClass="io.vertx.core.Launcher" -Dexec.args="run com.salesmanagement.MainVerticle"
```

### Using the fat JAR:
```bash
java -jar target/sales-management-backend-1.0.0-fat.jar
```

### With custom configuration:
```bash
java -jar target/sales-management-backend-1.0.0-fat.jar \
  -Dhttp.port=8080 \
  -DDB_HOST=localhost \
  -DDB_PORT=5432 \
  -DDB_NAME=sales_management \
  -DDB_USER=postgres \
  -DDB_PASSWORD=postgres
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `DELETE /api/orders/:id` - Delete an order

### Health Check
- `GET /health` - Health check endpoint

## API Request/Response Examples

### Signup
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Create Product
```json
POST /api/products
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 999.99,
  "stock": 15,
  "description": "High-performance laptop"
}
```

### Create Order
```json
POST /api/orders
{
  "customerId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [
    {
      "productId": 1,
      "productName": "Samsung TV",
      "unitPrice": 400.00,
      "quantity": 2
    }
  ]
}
```

## CORS Configuration

The backend is configured to accept requests from `http://localhost:4200` (Angular frontend). To change this, modify the CORS configuration in `MainVerticle.java`.

## Project Structure

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/salesmanagement/
│       │       ├── MainVerticle.java          # Main application entry point
│       │       ├── config/
│       │       │   └── DatabaseConfig.java     # Database configuration
│       │       ├── models/                     # Data models
│       │       ├── repositories/               # Data access layer
│       │       ├── routes/                     # API route handlers
│       │       └── utils/                      # Utility classes
│       └── resources/
│           └── db/
│               └── migration/                  # Database migration scripts
├── pom.xml                                     # Maven configuration
└── README.md
```

## Development

### Running Tests
```bash
mvn test
```

### Code Formatting
The project follows standard Java conventions. Consider using an IDE formatter or checkstyle.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials
- Check if the database exists
- Ensure the migration script has been executed

### Port Already in Use
Change the port by setting the `HTTP_PORT` environment variable or modifying the default in `MainVerticle.java`.

## License

This project is part of the Sales Management System.
