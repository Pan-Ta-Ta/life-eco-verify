# Life Eco — email confirmation page

A single static page that email confirmation links land on.

It reads the result Supabase puts in the URL and says one of three things:
the address is verified, the link has already been used, or the link is not
valid any more. On a phone it offers a button that opens the app.

No build step, no dependencies, no network requests. One file: `index.html`.
