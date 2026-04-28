function handleAuth(event) {
    event.preventDefault();
    
    // Obtenemos los valores que SIEMPRE existen
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    if (authMode === 'register') {
        // Buscamos el campo de nombre SOLO si estamos en registro
        const nameInput = document.getElementById('auth-name');
        
        // Verificamos que el input exista antes de pedir su valor
        if (!nameInput || !nameInput.value) {
            showToast("Por favor, ingresa tu nombre");
            return;
        }

        const name = nameInput.value;

        // Verificar si el correo ya existe
        if (usuariosRegistrados.some(u => u.email === email)) {
            showToast("Este correo ya está registrado");
            return;
        }

        // Guardar usuario
        usuariosRegistrados.push({ name, email, pass });
        localStorage.setItem('usuarios', JSON.stringify(usuariosRegistrados));
        
        showToast("¡Registro exitoso! Ahora puedes entrar.");
        
        // Resetear formulario y volver a login
        document.getElementById('auth-form').reset();
        switchAuth('login');

    } else {
        // Lógica de Login (Entrar)
        const usuario = usuariosRegistrados.find(u => u.email === email && u.pass === pass);
        
        if (usuario) {
            usuarioActivo = usuario;
            localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
            document.getElementById('user-greeting').innerText = `Hola, ${usuario.name.split(' ')[0]}`;
            showStore();
            showToast("Bienvenido a AMZON");
        } else {
            showToast("Correo o contraseña incorrectos");
        }
    }
}
