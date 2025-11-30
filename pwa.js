
class PWAHelper {
    constructor() {
        this.deferredPrompt = null;
        this.installPrompt = document.getElementById('installPrompt');
        this.installButton = document.getElementById('installButton');
        this.cancelInstall = document.getElementById('cancelInstall');
        
        this.init();
    }

    init() {
       
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

       
        this.installButton.addEventListener('click', () => {
            this.installApp();
        });

        
        this.cancelInstall.addEventListener('click', () => {
            this.hideInstallPrompt();
        });

        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPrompt();
            this.deferredPrompt = null;
        });

        
        this.displayMode();
    }

    showInstallPrompt() {
        
        if (!this.isInStandaloneMode() && this.deferredPrompt) {
            setTimeout(() => {
                this.installPrompt.style.display = 'block';
            }, 3000); 
        }
    }

    hideInstallPrompt() {
        this.installPrompt.style.display = 'none';
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            this.deferredPrompt = null;
        }
        this.hideInstallPrompt();
    }

    isInStandaloneMode() {
        return (window.matchMedia('(display-mode: standalone)').matches) ||
               (window.navigator.standalone) ||
               document.referrer.includes('android-app://');
    }

    displayMode() {
        if (this.isInStandaloneMode()) {
            console.log('Running in standalone mode');
            document.body.classList.add('standalone');
        }
    }
}

new PWAHelper();