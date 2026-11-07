# The FAQ in es; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "¿Qué es testee?",
        "answer": "Una entrevista cronometrada de opción múltiple creada a partir de tu descripción del puesto, para cualquier puesto. Úsala para filtrar candidatos antes de conocerlos o como un paso más de la contratación: en ambos casos ves quién domina de verdad el trabajo.",
    },
    {
        "key": "roles",
        "question": "¿Para qué puestos puedo contratar?",
        "answer": "Cualquier puesto en el que importen los conocimientos: soporte, ventas, finanzas, salud, oficios, ingeniería, marketing y más. Si puedes describir el trabajo, testee puede crear una entrevista para él.",
    },
    {
        "key": "hiring",
        "question": "¿Cómo funciona?",
        "answer": "Pega una descripción del puesto en la página de inicio, pon el nombre de tu empresa y revisa los temas que propone testee. Después invita a candidatos: escribe sus correos, pega una lista o sube un archivo. Los candidatos que no hayan empezado tras unos días reciben un recordatorio. Cada candidato recibe sus propias preguntas, cada una con su temporizador, y ves su puntuación y cada respuesta en cuanto termina.",
    },
    {
        "key": "templates",
        "question": "¿Puedo empezar con una entrevista ya hecha?",
        "answer": "Sí. La pestaña Plantillas de tu empresa muestra entrevistas ya hechas por puesto, que puedes buscar y filtrar por nivel e idioma. Los propietarios y administradores pueden copiar una a la empresa al instante, gratis, y luego cambiarla como cualquier entrevista; los candidatos se cobran como siempre.",
    },
    {
        "key": "link",
        "question": "¿Puedo poner una entrevista en una oferta de empleo?",
        "answer": "Sí. Activa el enlace para compartir de la entrevista en su pestaña Ajustes y pégalo en tu oferta. Cualquiera que lo abra inicia sesión y hace la entrevista, y cada persona cuesta lo mismo que un candidato invitado. Sin créditos disponibles, el enlace no admite a más personas nuevas. El enlace se desactiva cuando marcas el puesto de la entrevista como cubierto.",
    },
    {
        "key": "preview",
        "question": "¿Puedo probar una entrevista antes de invitar a nadie?",
        "answer": "Sí. Abre tu entrevista como candidato desde su página, sin coste: las vistas previas no aparecen entre tus candidatos ni en las estadísticas de preguntas. También puedes hacer cualquiera de las entrevistas de práctica gratuitas.",
    },
    {
        "key": "question_quality",
        "question": "¿Cómo se comprueba que las preguntas son correctas?",
        "answer": "Antes de que una entrevista esté lista, una segunda IA revisa una muestra de sus respuestas correctas. Después, las respuestas, los votos y los avisos de problemas señalan las preguntas débiles, que se corrigen o sustituyen en segundo plano para los candidatos que empiecen después; las notas ya dadas no cambian. En la página de un tema puedes leer cada pregunta, y los propietarios y administradores pueden desactivar una, regenerarla o marcar su respuesta como incorrecta.",
    },
    {
        "key": "open-to-offers",
        "question": "¿Pueden las empresas encontrarme a través de mi práctica?",
        "answer": "Solo si tú lo eliges. Activa Abierto a ofertas después de una ronda de práctica o en Ajustes, con la dirección de tu perfil de LinkedIn. Entonces, las empresas que han recargado en testee ven tu nombre, tu perfil de LinkedIn y tu último resultado de práctica en cada tema de sus entrevistas que hayas practicado, y pueden invitarte a una entrevista. testee no te clasifica ni te recomienda. Desactívalo cuando quieras en Ajustes y desaparecerás al instante de la lista de todas las empresas; además, se desactiva un año después de la última vez que lo activaste o guardaste tu perfil de LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "¿Pueden los candidatos usar IA o buscar las respuestas?",
        "answer": "Cada candidato recibe preguntas elegidas al azar de cada tema, en su propio orden, con [un temporizador en cada pregunta](/guides/skills-test-timing-and-extra-time) que controla nuestro servidor, así que hay poco tiempo para buscar las respuestas o preguntar a una IA. Las fichas de evaluación también muestran cuándo un candidato salió de la página, copió texto o respondió demasiado rápido para haber leído la pregunta. Cuando termina, su página también señala patrones de respuesta que suele dejar pasarle las preguntas a una IA, como más o menos el mismo tiempo en cada pregunta o preguntas difíciles acertadas mientras fallaba las fáciles, y sugiere preguntas que acertó para tratar en una entrevista en vivo. Un patrón es un motivo para preguntar, no una prueba. Antes de empezar, cada candidato también confirma que responderá por su cuenta, sin herramientas de IA ni ayuda de otras personas, y su ficha de evaluación lo muestra.",
    },
    {
        "key": "practice",
        "question": "¿Puedo practicar gratis?",
        "answer": "Sí. La [página de práctica](/practice) tiene entrevistas gratuitas por puesto: inicia sesión, elige tiempo estándar, tiempo doble o sin límite de tiempo, y ve tu nota y cada respuesta correcta al final. Tu práctica es privada; las empresas solo ven un resultado si activas Abierto a ofertas.",
    },
    {
        "key": "voice",
        "question": "¿Pueden los candidatos responder con la voz?",
        "answer": "Sí, si la empresa configura una entrevista en modo de voz, en cualquiera de los 23 idiomas de testee; lo bien que lee y entiende depende del idioma (la guía «Entrevistas por voz en 23 idiomas» lo muestra para cada uno). Las preguntas se leen en voz alta y los candidatos responden hablando; lo que dicen se convierte en texto y se asocia a una opción. testee no lo guarda; OpenAI, que hace esto por nosotros, puede conservarlo hasta 30 días, solo para detectar abusos salvo que la ley exija más tiempo. Las voces no se analizan para detectar tono ni emociones, y los candidatos siempre pueden tocar una opción en su lugar.",
    },
    {
        "key": "extra_time",
        "question": "¿Puede un candidato tener tiempo extra?",
        "answer": "Sí. Antes de que un candidato empiece, los propietarios y administradores pueden darle un 25 %, un 50 % o un 100 % más de tiempo en cada pregunta, en la página del candidato; no se registra ningún motivo. Quien use un enlace para compartir debe pedir antes a la empresa una invitación personal. Consulta [cómo cronometrar una prueba de habilidades](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "¿Puede un candidato repetir una entrevista o volver atrás?",
        "answer": "No. Una entrevista se hace una sola vez, de una pasada: un candidato puede cambiar su elección hasta que pulse «Siguiente pregunta», y entonces es definitiva. Cuando ha terminado, no se le puede volver a invitar a esa entrevista.",
    },
    {
        "key": "connection",
        "question": "¿Qué pasa si se corta la conexión de un candidato o cierra la página?",
        "answer": "Abre el mismo enlace y continúa. Mientras tanto, el reloj de nuestro servidor sigue corriendo: una pregunta cuyo tiempo se agota mientras está ausente cuenta como incorrecta, y el temporizador de la siguiente empieza cuando se muestra. Una entrevista sin terminar acaba sola cuando ha pasado su tiempo total más un 10 %.",
    },
    {
        "key": "cost",
        "question": "¿Cuánto cuesta?",
        "answer": "Generar entrevistas es gratis. Cada candidato que responde al menos una pregunta cuesta {candidate} créditos ({candidate_price}), y menos con créditos de recargas más grandes, hasta {cheapest_price}. Tu primera empresa recibe {company} créditos gratis, suficientes para sus primeros {company_candidates} candidatos. Los precios no incluyen el IVA ni el impuesto sobre las ventas. La [página de precios](/pricing) muestra todos los precios.",
    },
    {
        "key": "charged",
        "question": "¿Cuándo se cobra por un candidato?",
        "answer": "Una vez que ha respondido al menos una pregunta: cuando termina su entrevista (la termina él o se acaba el tiempo mientras está ausente) o cuando lo revocas, lo que también borra sus respuestas para siempre. Una pregunta cuyo tiempo se agotó sin elegir respuesta no cuenta. Sus créditos se reservan al invitarlo (con un enlace, cuando empieza) y se devuelven si lo revocas antes de que responda nada, si nunca empieza y la invitación caduca a los 30 días, o si su entrevista termina sin ninguna respuesta.",
    },
    {
        "key": "compare_hiring",
        "question": "¿Cómo se compara el precio con otras herramientas de evaluación?",
        "answer": "Muchas herramientas de evaluación se venden como suscripción mensual o anual, que pagas aunque no evalúes a nadie. Con testee pagas solo por candidato, con créditos comprados por adelantado: {candidate} créditos ({candidate_price}), sin contrato, sin cuotas por usuario y sin pagar por generar una entrevista. Una empresa que invita a {example_candidates} candidatos al mes paga unos {example_year_price} al año antes de impuestos. Si evalúas a muchos candidatos cada mes, una suscripción puede salir más barata, así que compara con tus propias cifras.",
    },
    {
        "key": "top_up",
        "question": "¿Cómo compro créditos?",
        "answer": "Los propietarios y administradores recargan en la página de recarga, en el menú de la cuenta, para entre {min_candidates} y {max_candidates} candidatos cada vez. Paddle cobra el pago, añade el IVA o el impuesto sobre las ventas que corresponda y emite el recibo o la factura; la factura de cada recarga también está en la pestaña Facturación de la empresa.",
    },
    {
        "key": "expire",
        "question": "¿Caducan los créditos?",
        "answer": "No. Los créditos nunca caducan y no hay suscripciones de pago. Si activas la recarga automática opcional, Paddle guarda tu tarjeta como una suscripción de {zero_price}; solo pagas las recargas que haga.",
    },
    {
        "key": "auto_top_up",
        "question": "¿Pueden recargarse los créditos automáticamente?",
        "answer": "Sí, si un propietario o administrador lo activa en la página de recarga: elige una recarga y el saldo por debajo del cual recargar, y marca lo que cobra y cuándo. Cada vez que el saldo disponible de la empresa baja de ese nivel, se cobra a la tarjeta guardada, más los impuestos que correspondan, y los propietarios y administradores de la empresa reciben un correo. Un cargo rechazado se reintenta a los 1, 3 y 7 días; después, la recarga automática se pausa hasta que se actualice la tarjeta. Desactivarla donde la activaste la detiene al instante.",
    },
    {
        "key": "currency",
        "question": "¿En qué moneda pago?",
        "answer": "Los precios están en la moneda local en Canadá, Australia, Israel, Polonia, Suiza, Japón, Corea del Sur, Taiwán, Hong Kong, Tailandia, Singapur e India; en euros en el resto de la UE y en Islandia, Liechtenstein y Noruega; en libras en el Reino Unido; y en dólares estadounidenses en el resto del mundo. Tu cuenta y cada empresa conservan la moneda del país donde se crearon o se usaron por primera vez, viajes a donde viajes: cambia la tuya en Ajustes, y la de una empresa en la página de recarga (propietarios y administradores). Las recargas de una empresa, también las automáticas, se cobran siempre en la moneda de la empresa.",
    },
    {
        "key": "referrals",
        "question": "¿Puedo ganar créditos recomendando una empresa?",
        "answer": "Sí. Comparte el enlace de la pestaña Recomendaciones de tu empresa: cuando una empresa nueva creada a través de él recarga por primera vez, cualquier importe, las dos empresas reciben {referral} créditos, hasta 25 recomendaciones al año. Solo cuenta la primera empresa del correo de su propietario, y tus propias empresas no cuentan.",
    },
    {
        "key": "refunds",
        "question": "¿Puedo obtener un reembolso?",
        "answer": "Sí, de los créditos que compraste en los últimos 14 días y no has gastado: en la página de facturación de tu empresa, a través de Paddle o escribiéndonos. Los créditos reservados para candidatos no se pueden reembolsar mientras estén reservados; los reservados dentro de los 14 días se pueden reembolsar durante los 7 días siguientes a su vuelta. Los créditos gratis, como el regalo de bienvenida, no se reembolsan y se consideran gastados primero. Los [términos](/terms) tienen los detalles.",
    },
    {
        "key": "scorecards",
        "question": "¿Qué muestran las fichas de evaluación?",
        "answer": "Cada respuesta, si fue correcta y cuánto tardó. La nota es el porcentaje de puntos obtenidos: cada pregunta vale un punto, y una de «selecciona todas las correctas» da una parte por cada opción correcta marcada, y nada si se marca una incorrecta. Las notas se ven en verde o rojo según la nota de aprobado que fijaste para la entrevista. Las fichas también señalan respuestas demasiado rápidas para haber leído la pregunta, las veces que el candidato salió de la página y los intentos de copiar.",
    },
    {
        "key": "reports",
        "question": "¿Puedo compartir los resultados con un responsable de contratación?",
        "answer": "Sí. Descarga un informe PDF de un candidato o de todos los candidatos de una entrevista, envíalo por correo directamente desde testee o manda un breve resumen por WhatsApp, Telegram, Viber o LINE.",
    },
    {
        "key": "action_log",
        "question": "¿Puedo ver quién hizo qué en mi empresa?",
        "answer": "Sí, si eres el propietario de la empresa. Su pestaña Registro de acciones muestra lo que hicieron sus miembros, de lo más reciente a lo más antiguo: invitar o quitar candidatos, ver resultados y cambiar las entrevistas, el equipo, la facturación y las integraciones, con quién lo hizo, cuándo y si lo hizo en su nombre el asistente, una app de IA, la API o un ATS. Puedes filtrarlo por miembro, tipo de acción y fechas, y descargarlo como archivo CSV. Las acciones se guardan durante 12 meses. Las acciones de una clave de API aparecen con el nombre de la clave.",
    },
    {
        "key": "bias_audit",
        "question": "¿Puedo exportar resultados para una auditoría de sesgos?",
        "answer": "Sí, si eres el propietario de la empresa. La pestaña Registro de acciones tiene una opción «Exportar para auditoría de sesgos»: un archivo CSV con cada candidato que terminó, de todas las entrevistas o de una y entre las fechas elegidas, con su nota, la nota de aprobado, si aprobó y si superó la mediana de la entrevista. testee no tiene datos sobre sexo, raza ni etnia, así que añades las respuestas que tus candidatos hayan dado sobre sí mismos usando su correo, y eliminas los correos antes de dar el archivo a tu auditor independiente.",
    },
    {
        "key": "notes",
        "question": "¿Puede mi equipo dejar comentarios sobre una entrevista?",
        "answer": "Sí. Cada entrevista tiene una pestaña Comentarios donde tu equipo escribe comentarios en texto sin formato sobre el proceso de selección, como a quién llamar a continuación o, en una agencia, para qué cliente es la entrevista. Cualquier miembro puede escribir comentarios, también los lectores, y editar los suyos; pueden eliminar uno su autor, los propietarios y los administradores. Los propietarios y administradores pueden fijar un comentario, que entonces aparece bajo el nombre de la entrevista. Los candidatos nunca ven los comentarios.",
    },
    {
        "key": "team",
        "question": "¿Puedo añadir a mi equipo?",
        "answer": "Sí, y los miembros no cuestan nada. En la pestaña Equipo de la empresa, el propietario invita a cada persona por correo como administrador o lector. Los administradores hacen todo menos gestionar el equipo, ver el registro de acciones y eliminar la empresa. Los lectores ven entrevistas y resultados, comparten informes y escriben comentarios, pero no cambian nada más ni pueden recargar. Una cuenta puede ser propietaria de varias empresas, cada una con su equipo y sus créditos.",
    },
    {
        "key": "integrations",
        "question": "¿testee funciona con mi ATS u otras herramientas?",
        "answer": "Sí, sin coste adicional; los candidatos se cobran como siempre. Los propietarios y administradores conectan Workable, Greenhouse, Teamtailor, Recruitee o Breezy HR en la pestaña Integraciones de la empresa con una clave del ATS y luego vinculan una oferta a una entrevista y a una etapa: los candidatos que muevas a esa etapa reciben la entrevista, y sus resultados vuelven al ATS ([cómo conectar las pruebas de habilidades a tu ATS](/guides/ats-integration-skills-tests)). Slack puede publicar las notificaciones de tu empresa en un canal, y la API permite que tu propia plataforma cree entrevistas, invite y gestione candidatos y reciba sus resultados, con cada clave de API limitada a lo que marques para ella; consulta la [Documentación de la API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "¿Cómo funciona la integración con Slack?",
        "answer": "Un propietario o administrador elige «Añadir a Slack» en la pestaña Integraciones de la empresa y selecciona un canal, y luego elige qué notificaciones llegan allí, como que un candidato ha terminado, una invitación no entregada, un candidato del ATS no invitado o un comentario nuevo. Es gratis.",
    },
    {
        "key": "api_keys",
        "question": "¿Cómo funcionan las claves de API?",
        "answer": "Los propietarios y administradores las crean en la página API de la empresa, en Integraciones. Marcas lo que puede hacer cada clave, eliges cuándo caduca (en 1, 3, 6 o 12 meses, o nunca) y puedes limitarla a direcciones IP permitidas. Una clave se muestra una sola vez. Una empresa puede hacer 60 solicitudes por minuto. La [documentación para desarrolladores](/api-docs) describe cada llamada.",
    },
    {
        "key": "webhooks",
        "question": "¿Puede testee avisar a mi sistema cuando un candidato termina?",
        "answer": "Sí, con webhooks, que se configuran en la página API de la empresa. testee llama a tu dirección cuando un candidato empieza, termina (con sus resultados), no se le localiza, caduca o se le quita, y cuando una entrevista está lista, y firma cada llamada con tu secreto. Una llamada que falla se reintenta durante 3 días; después, el webhook se pausa hasta que un evento de prueba llegue bien. Cada webhook tiene un registro de sus últimos envíos. Consulta la [documentación de webhooks](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "¿Pueden los candidatos hacer la entrevista en mi propio sitio?",
        "answer": "Sí, con el SDK de testee: un script que muestra la entrevista dentro de tu página, en los sitios que permitas en la página API de la empresa. Tu servidor invita a cada candidato a través de la API con el inicio de sesión desactivado, así que no necesita una cuenta de testee y testee no le envía ningún correo. No cuesta nada más; los candidatos se cobran como siempre. Consulta la [documentación del SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "¿Puedo usar testee desde Claude, ChatGPT o mi propio agente de IA?",
        "answer": "Sí. Añade testee a Claude o ChatGPT como conector (los pasos están en la pestaña Integraciones de tu empresa) y permítelo en testee, solo para leer o también para hacer cambios. A partir de ahí, la app trabaja con tus empresas, entrevistas y los resultados de los candidatos en tu nombre, con tus permisos. Tu cuenta o una empresa solo se eliminan en testee. Lo que la app lee llega a su proveedor según las condiciones de esa app. Puedes desconectarla en cualquier momento en la misma pestaña, y los propietarios y administradores pueden desactivar las apps de IA para una empresa. También se pueden conectar otras apps de IA y agentes que crees tú mismo: la [pestaña MCP](/api-docs?tab=mcp) de la documentación para desarrolladores tiene los pasos y agentes de ejemplo, y un agente en un servidor puede iniciar sesión con una clave de API que tenga el permiso de agentes de IA, y hace solo lo que permiten los demás permisos de la clave. La [guía sobre agentes de IA, MCP y API](/guides/ai-agents-mcp-and-api) explica para qué sirve cada uno.",
    },
    {
        "key": "candidates",
        "question": "¿Qué ven los candidatos?",
        "answer": "El nombre y el logo de tu empresa, con los colores y las fuentes de tu empresa (definidos en su pestaña Marca), qué esperar antes de empezar y luego una pregunta cronometrada cada vez. La entrevista nunca les muestra su puntuación ni si una respuesta fue correcta; solo la descarga de sus propios datos incluye su nota.",
    },
    {
        "key": "brand",
        "question": "¿Pueden las entrevistas llevar la marca de mi empresa?",
        "answer": "Sí, sin coste adicional. En la pestaña Marca de la empresa, los propietarios y administradores definen su logo, los colores de los temas claro y oscuro, las fuentes y el redondeo de las esquinas. Los candidatos los ven durante toda la entrevista, sin la cabecera ni el pie de página de testee, y el logo también aparece en correos e informes.",
    },
    {
        "key": "candidate_account",
        "question": "¿Los candidatos necesitan una cuenta?",
        "answer": "Sí, y es gratis: inician sesión con Google, LinkedIn o GitHub, con el correo verificado que invitaste, así que una invitación reenviada no le sirve a nadie más. Con un enlace para compartir, vale cualquier correo verificado. La excepción es una invitación que tu propia plataforma hace a través de la API, que puede omitir el inicio de sesión.",
    },
    {
        "key": "verified",
        "question": "¿Qué significa la marca de verificación?",
        "answer": "Que un propietario o administrador de la empresa inició sesión con un correo de trabajo del sitio web de la empresa, como tu@acme.com, y que después nuestro equipo revisó la empresa. Añade el sitio web con Verificar en la cabecera de tu empresa; los servicios de correo gratuitos no cuentan. Mientras la revisión está pendiente, tu equipo ve un reloj junto al nombre, y cambiar el nombre de la empresa la envía de nuevo a revisión. La marca aparece junto al nombre de tu empresa, también en las invitaciones.",
    },
    {
        "key": "languages",
        "question": "¿Qué idiomas se admiten?",
        "answer": "{count} idiomas, para el sitio, las entrevistas y los correos. Elige el idioma en que se escribe una entrevista, sea cual sea el idioma de la descripción del puesto.",
    },
    {
        "key": "mira",
        "question": "¿Quién es Mira?",
        "answer": "El asistente de IA de testee: una IA, no una persona, y sus respuestas pueden ser incorrectas. Ábrelo con «preguntar a Mira» en la cabecera. Los visitantes pueden preguntar cualquier cosa sobre testee. Con la sesión iniciada, Mira también lee tus empresas con tu acceso y hace los cambios que le pidas, cada uno solo después de que lo confirmes. Preguntar a Mira no gasta créditos, y los candidatos no pueden usarlo durante una entrevista.",
    },
    {
        "key": "search",
        "question": "¿Puedo buscar en testee?",
        "answer": "Sí. La búsqueda de la cabecera encuentra, mientras escribes, tus empresas, entrevistas y candidatos (por nombre o correo), y las páginas, guías, comparativas, textos legales, preguntas frecuentes y pruebas de habilidades del sitio. Sin iniciar sesión, solo encuentra lo que es público.",
    },
    {
        "key": "privacy",
        "question": "¿Qué pasa con las descripciones de puesto y las respuestas?",
        "answer": "Las descripciones de puesto se usan para crear las entrevistas de tu empresa, y las respuestas de los candidatos, para puntuarlas para tu empresa. Las preguntas que genera testee también pueden reutilizarse en las entrevistas y la práctica de otras empresas, sin nada que te identifique a ti, a tu empresa ni a ninguna otra persona; puedes excluir de esto las preguntas de una entrevista en sus ajustes. testee también extrae, de cómo se responden las preguntas, patrones generales y anonimizados sobre su calidad para mejorar cómo se generan las preguntas. La [política de privacidad](/privacy) explica qué guardamos, durante cuánto tiempo y los derechos de cada persona.",
    },
    {
        "key": "question_bank",
        "question": "¿Las preguntas de mi entrevista se comparten con otras empresas?",
        "answer": "De forma predeterminada, sí. Una pregunta generada por testee puede entrar en su banco de preguntas compartido cuando se ha respondido unas cuantas veces y supera comprobaciones de que no nombra ninguna organización, persona ni datos de contacto; la copia no contiene nada que identifique a tu empresa. Los propietarios y administradores pueden dejar fuera las preguntas de una entrevista en su pestaña Ajustes; no hay un ajuste para toda la empresa. Las preguntas ya reutilizadas se quedan, aunque se elimine tu empresa.",
    },
    {
        "key": "ai_training",
        "question": "¿Se usan nuestros datos para entrenar modelos de IA?",
        "answer": "OpenAI, que impulsa la IA de testee, no entrena sus modelos con lo que le enviamos, según sus condiciones de API; puede conservarlo hasta 30 días, solo para detectar abusos, salvo que la ley exija más tiempo. testee aprende por su parte patrones generales y anonimizados sobre la calidad de las preguntas, para mejorar cómo se generan.",
    },
    {
        "key": "data_storage",
        "question": "¿Dónde se guardan nuestros datos?",
        "answer": "En Google Cloud, en Bélgica. Algunos proveedores tratan datos en Estados Unidos, como OpenAI y Resend, conforme al Marco de Privacidad de Datos UE-EE. UU. o a las cláusulas contractuales tipo de la Comisión Europea. La [página de confianza](/trust) los enumera todos.",
    },
    {
        "key": "eu_ai_law",
        "question": "¿Es legal usar IA en la preselección de candidatos en la UE?",
        "answer": "Sí, con normas. Según el Reglamento de IA de la UE (AI Act), las herramientas que puntúan a candidatos son muy probablemente de alto riesgo, con obligaciones desde el 2 de diciembre de 2027, y el RGPD ya se aplica: una persona toma la decisión de contratación, se informa a los candidatos de que se usa IA y se guardan registros. testee funciona así: la IA redacta las preguntas, las personas de tu empresa revisan los resultados y deciden, y se informa a los candidatos antes de empezar. Esto no es asesoramiento jurídico; [¿Es legal usar IA en la selección de personal en la UE?](/guides/is-ai-hiring-legal-in-the-eu) explica las normas y las fechas.",
    },
    {
        "key": "uk_us",
        "question": "¿Podemos usar testee con candidatos del Reino Unido y Estados Unidos?",
        "answer": "Sí. El acuerdo de tratamiento de datos cubre la legislación del Reino Unido y de Estados Unidos, y las instrucciones para empresas y las plantillas de aviso para candidatos (con versiones para la ciudad de Nueva York, Illinois y Colorado) cubren lo que debes comunicar a los candidatos. Para puestos en la ciudad de Nueva York, úsalo solo cuando hayas cumplido lo que te exige la Local Law 144: una auditoría de sesgos independiente en el año anterior a su uso, la publicación de su resumen y un aviso a los candidatos 10 días hábiles antes. La exportación para auditoría de sesgos del Registro de acciones da a tu auditor la nota y el resultado de cada candidato que terminó, para cruzarlos con las respuestas que tus candidatos dieron ellos mismos.",
    },
    {
        "key": "emails",
        "question": "¿Qué correos envía testee y cómo dejo de recibirlos?",
        "answer": "Los correos del servicio, como invitaciones, informes, correos de facturación y cambios en nuestros términos, se envían siempre. El resto, como el resumen de actividad diario, los recordatorios, las novedades del producto y las ofertas, lo eliges en Ajustes, en Correos, o lo detienes con el enlace «Cancelar la suscripción» de cada correo. Los candidatos pueden dejar de recibir los correos de tu empresa, o los recordatorios de una entrevista, con los enlaces de sus invitaciones y recordatorios. Las novedades de testee aparecen en tus notificaciones, la campana de arriba; las más importantes también llegan por correo como novedad del producto, solo mientras ese ajuste esté activado.",
    },
    {
        "key": "data_export",
        "question": "¿Puedo descargar mis datos?",
        "answer": "Sí. «Descargar mis datos» en Ajustes te da un archivo JSON con lo que testee tiene sobre ti; de las entrevistas de una empresa incluye tus respuestas y notas, pero no qué respuestas eran correctas. No hay exportación de una empresa entera: su propietario puede descargar el registro de acciones, y los miembros pueden descargar los informes en PDF de los candidatos.",
    },
    {
        "key": "candidate_data",
        "question": "¿Cómo puede un candidato hacer que se eliminen sus datos?",
        "answer": "Pidiéndoselo a la empresa que lo invitó: revocar a un candidato que ha empezado lo borra para siempre, junto con sus resultados. O eliminando su cuenta de testee en Ajustes, lo que elimina sus resultados. Si no, los resultados se eliminan automáticamente 12 meses después del último envío de la invitación.",
    },
    {
        "key": "delete",
        "question": "¿Puedo eliminar mi cuenta?",
        "answer": "Sí, en Ajustes, salvo que seas propietario de una empresa a la que se hayan unido otras personas: primero haz propietario a otro miembro o elimínala. Tu cuenta y tus datos se eliminan, con las empresas de las que eres el único miembro y sus créditos, así que pide antes cualquier reembolso que te corresponda. Una empresa conserva el registro de tu invitación sin tu correo, y los registros de compra se mantienen como exige la ley contable. Antes puedes descargar una copia de tus datos.",
    },
    {
        "key": "company_delete",
        "question": "¿Puedo eliminar una empresa?",
        "answer": "Sí, si eres su propietario. Sus entrevistas, candidatos, resultados y créditos desaparecen para siempre y su recarga automática se detiene, así que pide antes cualquier reembolso que te corresponda. Las copias de sus preguntas que ya estén en el banco de preguntas compartido se quedan.",
    },
    {
        "key": "report",
        "question": "¿Cómo informo de un problema?",
        "answer": "Escríbenos desde la [página de contacto](/contact) y pega el ID de aquello de lo que se trate: «copiar id» está debajo del nombre de una empresa, una entrevista o un candidato, y el de tu cuenta, en el menú de tu cuenta y en Ajustes. Con el ID lo encontramos enseguida.",
    },
]
