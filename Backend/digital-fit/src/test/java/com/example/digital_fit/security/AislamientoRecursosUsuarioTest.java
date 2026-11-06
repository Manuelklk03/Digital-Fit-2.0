package com.example.digital_fit.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.digital_fit.dto.Valoracion.CrearValoracionDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.Entrenamientos.HistorialEntrenamientos;
import com.example.digital_fit.model.Enums.Rol;
import com.example.digital_fit.model.Enums.TipoDeValoracion;
import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.HistorialEntrenamientosRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoUsuarioRepository;
import com.example.digital_fit.repository.Valoracion.ValoracionRepository;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoUsuarioService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoUsuarioService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoUsuarioService;
import com.example.digital_fit.service.Valoracion.ValoracionService;

@ExtendWith(MockitoExtension.class)
class AislamientoRecursosUsuarioTest {

    private Usuario usuarioPropietario;
    private Usuario usuarioAtacante;

    @BeforeEach
    void setUp() {
        usuarioPropietario = new Usuario();
        usuarioPropietario.setId(1L);
        usuarioPropietario.setUsername("propietario");
        usuarioPropietario.setEmail("propietario@test.com");
        usuarioPropietario.setRol(Rol.USER);

        usuarioAtacante = new Usuario();
        usuarioAtacante.setId(2L);
        usuarioAtacante.setUsername("atacante");
        usuarioAtacante.setEmail("atacante@test.com");
        usuarioAtacante.setRol(Rol.USER);
    }

    @Nested
    @DisplayName("Aislamiento en Centros Privados de Usuario")
    class CentrosPrivadosIsolationTests {

        @Mock
        private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

        @Mock
        private UsuarioRepository usuarioRepository;

        @InjectMocks
        private CentroPrivadoUsuarioService centroPrivadoUsuarioService;

        @Test
        @DisplayName("Usuario B no puede consultar centro privado creado por Usuario A")
        void testUsuarioBNoPuedeVerCentroDeUsuarioA() {
            CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
            centro.setId(10L);
            centro.setNombre("Gimnasio Privado A");
            centro.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(centroPrivadoUsuarioRepository.findById(10L)).thenReturn(Optional.of(centro));

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    centroPrivadoUsuarioService.verDetalle(10L, "atacante"));

            assertEquals("No tienes permiso para ver este centro.", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario B no puede borrar centro privado perteneciente a Usuario A")
        void testUsuarioBNoPuedeBorrarCentroDeUsuarioA() {
            CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
            centro.setId(10L);
            centro.setNombre("Gimnasio Privado A");
            centro.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(centroPrivadoUsuarioRepository.findById(10L)).thenReturn(Optional.of(centro));

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    centroPrivadoUsuarioService.borrarDeMisCentrosGuardados(10L, "atacante"));

            assertEquals("No tienes permiso para borrar este centro.", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario A sí puede consultar su propio centro privado")
        void testUsuarioAPuedeVerSuPropioCentro() {
            CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
            centro.setId(10L);
            centro.setNombre("Gimnasio Privado A");
            centro.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("propietario")).thenReturn(Optional.of(usuarioPropietario));
            when(centroPrivadoUsuarioRepository.findById(10L)).thenReturn(Optional.of(centro));

            assertDoesNotThrow(() -> centroPrivadoUsuarioService.verDetalle(10L, "propietario"));
        }
    }

    @Nested
    @DisplayName("Aislamiento en Entrenamientos de Usuario")
    class EntrenamientosIsolationTests {

        @Mock
        private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

        @Mock
        private UsuarioRepository usuarioRepository;

        @InjectMocks
        private EntrenamientoUsuarioService entrenamientoUsuarioService;

        @Test
        @DisplayName("Usuario B no puede borrar un entrenamiento perteneciente a Usuario A")
        void testUsuarioBNoPuedeBorrarEntrenamientoDeUsuarioA() {
            EntrenamientoUsuario entrenamiento = new EntrenamientoUsuario();
            entrenamiento.setId(20L);
            entrenamiento.setNombre("Rutina Fuerza A");
            entrenamiento.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(entrenamientoUsuarioRepository.findById(20L)).thenReturn(Optional.of(entrenamiento));

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    entrenamientoUsuarioService.borrarDeMisEntrenamientos(20L, "atacante"));

            assertEquals("No tienes permiso para borrar este entrenamiento", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario A sí puede borrar su propio entrenamiento")
        void testUsuarioAPuedeBorrarSuPropioEntrenamiento() {
            EntrenamientoUsuario entrenamiento = new EntrenamientoUsuario();
            entrenamiento.setId(20L);
            entrenamiento.setNombre("Rutina Fuerza A");
            entrenamiento.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("propietario")).thenReturn(Optional.of(usuarioPropietario));
            when(entrenamientoUsuarioRepository.findById(20L)).thenReturn(Optional.of(entrenamiento));

            assertDoesNotThrow(() -> entrenamientoUsuarioService.borrarDeMisEntrenamientos(20L, "propietario"));
            verify(entrenamientoUsuarioRepository).save(entrenamiento);
        }
    }

    @Nested
    @DisplayName("Aislamiento en Lugares Públicos de Usuario")
    class LugaresPublicosIsolationTests {

        @Mock
        private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

        @Mock
        private UsuarioRepository usuarioRepository;

        @InjectMocks
        private LugarPublicoUsuarioService lugarPublicoUsuarioService;

        @Test
        @DisplayName("Usuario B no puede consultar lugar público privado de Usuario A")
        void testUsuarioBNoPuedeVerLugarDeUsuarioA() {
            LugarPublicoUsuario lugar = new LugarPublicoUsuario();
            lugar.setId(30L);
            lugar.setNombre("Calistenia Parque A");
            lugar.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(lugarPublicoUsuarioRepository.findById(30L)).thenReturn(Optional.of(lugar));

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    lugarPublicoUsuarioService.verDetalle(30L, "atacante"));

            assertEquals("No tienes permiso para ver este lugar.", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario B no puede borrar lugar público privado de Usuario A")
        void testUsuarioBNoPuedeBorrarLugarDeUsuarioA() {
            LugarPublicoUsuario lugar = new LugarPublicoUsuario();
            lugar.setId(30L);
            lugar.setNombre("Calistenia Parque A");
            lugar.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(lugarPublicoUsuarioRepository.findById(30L)).thenReturn(Optional.of(lugar));

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    lugarPublicoUsuarioService.borrarLugar(30L, "atacante"));

            assertEquals("No tienes permiso para borrar este lugar.", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario A sí puede consultar su propio lugar público privado")
        void testUsuarioAPuedeVerSuPropioLugar() {
            LugarPublicoUsuario lugar = new LugarPublicoUsuario();
            lugar.setId(30L);
            lugar.setNombre("Calistenia Parque A");
            lugar.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("propietario")).thenReturn(Optional.of(usuarioPropietario));
            when(lugarPublicoUsuarioRepository.findById(30L)).thenReturn(Optional.of(lugar));

            assertDoesNotThrow(() -> lugarPublicoUsuarioService.verDetalle(30L, "propietario"));
        }
    }

    @Nested
    @DisplayName("Aislamiento en Valoraciones de Recursos Privados")
    class ValoracionesIsolationTests {

        @Mock
        private ValoracionRepository valoracionRepository;

        @Mock
        private UsuarioRepository usuarioRepository;

        @Mock
        private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

        @Mock
        private HistorialEntrenamientosRepository historialEntrenamientosRepository;

        @Mock
        private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

        @Mock
        private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

        @InjectMocks
        private ValoracionService valoracionService;

        @Test
        @DisplayName("Usuario B no puede valorar un entrenamiento privado perteneciente a Usuario A")
        void testUsuarioBNoPuedeValorarEntrenamientoDeUsuarioA() {
            EntrenamientoUsuario entrenamiento = new EntrenamientoUsuario();
            entrenamiento.setId(40L);
            entrenamiento.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(entrenamientoUsuarioRepository.findById(40L)).thenReturn(Optional.of(entrenamiento));

            CrearValoracionDTO dto = new CrearValoracionDTO();
            dto.setPuntuacion(5);

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    valoracionService.crearOActualizar(TipoDeValoracion.ENTRENAMIENTO_USUARIO, 40L, dto, "atacante"));

            assertEquals("No puedes valorar un entrenamiento de usuario que no es tuyo", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario B no puede valorar un historial perteneciente a Usuario A")
        void testUsuarioBNoPuedeValorarHistorialDeUsuarioA() {
            HistorialEntrenamientos historial = new HistorialEntrenamientos();
            historial.setId(50L);
            historial.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(historialEntrenamientosRepository.findById(50L)).thenReturn(Optional.of(historial));

            CrearValoracionDTO dto = new CrearValoracionDTO();
            dto.setPuntuacion(4);

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    valoracionService.crearOActualizar(TipoDeValoracion.HISTORIAL_ENTRENAMIENTO, 50L, dto, "atacante"));

            assertEquals("No puedes valorar un historial que no es tuyo", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario B no puede valorar un centro privado perteneciente a Usuario A")
        void testUsuarioBNoPuedeValorarCentroPrivadoDeUsuarioA() {
            CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
            centro.setId(60L);
            centro.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(centroPrivadoUsuarioRepository.findById(60L)).thenReturn(Optional.of(centro));

            CrearValoracionDTO dto = new CrearValoracionDTO();
            dto.setPuntuacion(5);

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    valoracionService.crearOActualizar(TipoDeValoracion.CENTRO_PRIVADO_USUARIO, 60L, dto, "atacante"));

            assertEquals("No puedes valorar un centro privado que no es tuyo", ex.getMessage());
        }

        @Test
        @DisplayName("Usuario B no puede valorar un lugar público privado perteneciente a Usuario A")
        void testUsuarioBNoPuedeValorarLugarPublicoDeUsuarioA() {
            LugarPublicoUsuario lugar = new LugarPublicoUsuario();
            lugar.setId(70L);
            lugar.setUsuario(usuarioPropietario);

            when(usuarioRepository.findByUsername("atacante")).thenReturn(Optional.of(usuarioAtacante));
            when(lugarPublicoUsuarioRepository.findById(70L)).thenReturn(Optional.of(lugar));

            CrearValoracionDTO dto = new CrearValoracionDTO();
            dto.setPuntuacion(5);

            OperacionNoPermitida ex = assertThrows(OperacionNoPermitida.class, () ->
                    valoracionService.crearOActualizar(TipoDeValoracion.LUGAR_PUBLICO_USUARIO, 70L, dto, "atacante"));

            assertEquals("No puedes valorar un lugar público que no es tuyo", ex.getMessage());
        }
    }
}
