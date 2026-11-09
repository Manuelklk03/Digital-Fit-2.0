package com.example.digital_fit.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.digital_fit.dto.CentroPrivado.CrearCentroPrivadoDTO;
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoUsuario;
import com.example.digital_fit.dto.LugarPublico.CrearLugarPublicoDTO;
import com.example.digital_fit.dto.Valoracion.CrearValoracionDTO;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.model.Valoracion.Valoracion;

import jakarta.persistence.Column;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.constraints.Size;

class LongitudCamposDtoVsEsquemaTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    private int getColumnLength(Class<?> entityClass, String fieldName) throws NoSuchFieldException {
        Field field = entityClass.getDeclaredField(fieldName);
        Column column = field.getAnnotation(Column.class);
        return column != null ? column.length() : 255;
    }

    private int getDtoMaxSize(Class<?> dtoClass, String fieldName) throws NoSuchFieldException {
        Field field = dtoClass.getDeclaredField(fieldName);
        Size size = field.getAnnotation(Size.class);
        return size != null ? size.max() : Integer.MAX_VALUE;
    }

    @Test
    @DisplayName("Las anotaciones JPA de entidades coinciden con el límite de 1500 caracteres")
    void testEntidadesJpaTienenLongitud1500() throws NoSuchFieldException {
        assertEquals(1500, getColumnLength(EntrenamientoBase.class, "descripcion"));
        assertEquals(1500, getColumnLength(EntrenamientoUsuario.class, "descripcion"));
        assertEquals(1500, getColumnLength(CentroPrivadoBase.class, "descripcion"));
        assertEquals(1500, getColumnLength(CentroPrivadoUsuario.class, "descripcion"));
        assertEquals(1500, getColumnLength(LugarPublicoBase.class, "descripcion"));
        assertEquals(1500, getColumnLength(LugarPublicoUsuario.class, "descripcion"));
        assertEquals(1500, getColumnLength(Valoracion.class, "comentario"));
    }

    @Test
    @DisplayName("Los DTOs permiten hasta 1500 caracteres alineados con el esquema")
    void testDtosPermitenHasta1500Caracteres() throws NoSuchFieldException {
        assertEquals(1500, getDtoMaxSize(CrearEntrenamientoUsuario.class, "descripcion"));
        assertEquals(1500, getDtoMaxSize(CrearCentroPrivadoDTO.class, "descripcion"));
        assertEquals(1500, getDtoMaxSize(CrearLugarPublicoDTO.class, "descripcion"));
        assertEquals(1500, getDtoMaxSize(CrearValoracionDTO.class, "comentario"));
    }

    @Test
    @DisplayName("Bean Validation valida exactamente 1500 caracteres (válido) y 1501 caracteres (inválido)")
    void testValidacionDtosLimite1500() {
        String texto1500 = "a".repeat(1500);
        String texto1501 = "a".repeat(1501);

        // CrearValoracionDTO
        CrearValoracionDTO valOk = new CrearValoracionDTO();
        valOk.setPuntuacion(5);
        valOk.setComentario(texto1500);
        Set<ConstraintViolation<CrearValoracionDTO>> violacionesOk = validator.validate(valOk);
        assertTrue(violacionesOk.isEmpty(), "1500 caracteres debe ser valido en valoracion");

        CrearValoracionDTO valKo = new CrearValoracionDTO();
        valKo.setPuntuacion(5);
        valKo.setComentario(texto1501);
        Set<ConstraintViolation<CrearValoracionDTO>> violacionesKo = validator.validate(valKo);
        assertFalse(violacionesKo.isEmpty(), "1501 caracteres debe violar @Size(max=1500)");
    }
}
