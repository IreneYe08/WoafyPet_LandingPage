
  # WoafyPet Bed Landing Page (Copy)

  This is a code bundle for WoafyPet Bed Landing Page (Copy). The original project is available at https://www.figma.com/design/Oi4S1GSIlfhPvzsbD4aeGf/WoafyPet-Bed-Landing-Page--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

On the machine where the PHP API runs (e.g. your host), set the real values as environment variables. For example:
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
VIP_PAYMENT_LINK_ID
VIP_COUPON_ID
LARK_BOT_WEBHOOK_URL (if you use Lark notifications)
How you set them depends on the host (e.g. control panel env vars, .env loaded by the server, or your hosting docs). The code in config.php is ready to read from getenv().
