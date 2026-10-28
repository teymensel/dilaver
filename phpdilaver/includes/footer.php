            </main>
        </div> <!-- End #main-wrapper -->
    </div> <!-- End #app-layout -->
    
    <!-- Mobile Bottom Navigation (Visible only on < 1024px) -->
    <nav class="bottom-nav">
        <a href="?page=home" class="nav-link <?php echo $page == 'home' ? 'active' : ''; ?>">
            <i data-lucide="home"></i>
            <span>Ana Sayfa</span>
        </a>
        <a href="?page=morse" class="nav-link <?php echo $page == 'morse' ? 'active' : ''; ?>">
            <i data-lucide="zap"></i>
            <span>Mors</span>
        </a>
        <a href="?page=qcodes" class="nav-link <?php echo $page == 'qcodes' ? 'active' : ''; ?>">
            <i data-lucide="message-square"></i>
            <span>Q-Kodları</span>
        </a>
        <a href="?page=logbook" class="nav-link <?php echo $page == 'logbook' ? 'active' : ''; ?>">
            <i data-lucide="book-open"></i>
            <span>Kayıt</span>
        </a>
        <a href="?page=exams" class="nav-link <?php echo $page == 'exams' ? 'active' : ''; ?>">
            <i data-lucide="settings"></i>
            <span>Ayarlar</span>
        </a>
    </nav>

    <script>
        // Global Icon Bootstrapping
        function refreshIcons() {
            if (window.lucide) {
                lucide.createIcons();
            }
        }
        
        document.addEventListener('DOMContentLoaded', refreshIcons);
        window.addEventListener('load', refreshIcons);
        
        // Listen for Alpine custom events if any
        document.addEventListener('alpine:initialized', () => {
            refreshIcons();
        });
        
        // Final safety fallback
        setTimeout(refreshIcons, 1000);
    </script>
</body>
</html>
