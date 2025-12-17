import React from 'react';

interface FooterProps {
    client: string | null;
}

const Footer: React.FC<FooterProps> = ({ client }) => {
    const currentYear = new Date().getFullYear();
    
    const logos: { [key: string]: { url: string; alt: string; className: string; } } = {
        'default': {
            url: 'https://yfqkrnxlbbqbvwochsfd.supabase.co/storage/v1/object/sign/logo/BaristA:i.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MzIwN2ZjMi0xNjVkLTQ1ZmMtOGE2NS1lZDczM2I5YjdmZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL0JhcmlzdEE6aS5wbmciLCJpYXQiOjE3NjA3MzQxMTYsImV4cCI6NDg4Mjc5ODExNn0.P8JjlLvJSm4gPY6jpbqZORcGl3cpdegnkj-82k-QAAU',
            alt: 'BaristA:i Logo',
            className: 'h-12 w-auto opacity-70 hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
        },
        'allcafe': {
            url: 'https://yfqkrnxlbbqbvwochsfd.supabase.co/storage/v1/object/sign/logo/all%20cafe%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MzIwN2ZjMi0xNjVkLTQ1ZmMtOGE2NS1lZDczM2I5YjdmZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2FsbCBjYWZlIGxvZ28ucG5nIiwiaWF0IjoxNzYwNzM1MTcxLCJleHAiOjQ4ODI3OTkxNzF9.iFxmqpLDOSO5Lmg50vZoyKmfyxVgeZ7k83IGggpCTxw',
            alt: 'ALL café Logo',
            className: 'h-16 w-auto opacity-80 hover:opacity-100 transition-opacity'
        }
    };

    const logo = client && logos[client] ? logos[client] : logos['default'];

    return (
        <>
            <footer className="text-center py-8 px-4">
                <p className="text-xs text-[color:var(--text-color-muted)] font-mono">
                    BaristA:i &copy; {currentYear} Cheewit Manketwit. All rights reserved.
                    <br />
                    BaristA:i&trade; and BaristA:i Eyes&trade; are trademarks of Cheewit Manketwit.
                </p>
            </footer>
            
            <div className="fixed bottom-4 right-4 z-50">
                 <a href="#" onClick={(e) => e.preventDefault()} className="block" title={logo.alt}>
                    <img 
                        src={logo.url} 
                        alt={logo.alt} 
                        className={logo.className}
                        aria-hidden="true"
                    />
                </a>
            </div>
        </>
    );
};

export default Footer;