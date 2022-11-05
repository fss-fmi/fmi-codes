import {ReactNode} from 'react';

/**
 * Defines the layout of the application.
 * @param {RootLayout} children Children of the layout.
 * @return {RootLayout} Layout of the application.
 * @constructor
 */
export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html>
      <head>
        <title>FMICodes</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
