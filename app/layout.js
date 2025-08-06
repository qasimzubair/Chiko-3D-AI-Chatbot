import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

export const metadata = { 
  title: '3D Chatbot', 
  description: 'Talking avatar',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}
