use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};
use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeInputEvent {
    kind: &'static str,
    x: Option<f64>,
    y: Option<f64>,
    delta_x: Option<i64>,
    delta_y: Option<i64>,
}

#[tauri::command]
fn companion_status() -> &'static str { "NyanMate is awake" }

fn set_window_visible(app: &AppHandle, label: &str, visible: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(label) {
        if visible {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        } else { window.hide().map_err(|e| e.to_string())?; }
    }
    Ok(())
}

#[cfg(target_os = "windows")]
fn start_global_input_bridge(app: AppHandle) {
    std::thread::spawn(move || {
        use rdev::{listen, EventType};
        let emitter = app.clone();
        let result = listen(move |event| {
            let payload = match event.event_type {
                EventType::KeyPress(_) => Some(NativeInputEvent { kind: "key", x: None, y: None, delta_x: None, delta_y: None }),
                EventType::MouseMove { x, y } => Some(NativeInputEvent { kind: "mouseMove", x: Some(x), y: Some(y), delta_x: None, delta_y: None }),
                EventType::Wheel { delta_x, delta_y } => Some(NativeInputEvent { kind: "wheel", x: None, y: None, delta_x: Some(delta_x), delta_y: Some(delta_y) }),
                _ => None,
            };
            if let Some(payload) = payload {
                let _ = emitter.emit_to("main", "native-input-event", payload);
            }
        });
        if let Err(error) = result {
            let _ = app.emit_to("main", "native-input-status", format!("Global input listener unavailable: {error:?}"));
        }
    });
}

#[cfg(not(target_os = "windows"))]
fn start_global_input_bridge(app: AppHandle) {
    let _ = app.emit_to("main", "native-input-status", "System-wide input reactions are currently enabled on Windows only.");
}

#[tauri::command]
fn set_presenter_visible(app: AppHandle, visible: bool) -> Result<(), String> { set_window_visible(&app, "presenter", visible) }
#[tauri::command]
fn set_reports_visible(app: AppHandle, visible: bool) -> Result<(), String> { set_window_visible(&app, "reports", visible) }
#[tauri::command]
fn set_agenda_visible(app: AppHandle, visible: bool) -> Result<(), String> { set_window_visible(&app, "agenda", visible) }
#[tauri::command]
fn set_assistant_visible(app: AppHandle, visible: bool) -> Result<(), String> { set_window_visible(&app, "assistant", visible) }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            start_global_input_bridge(app.handle().clone());
            let show = MenuItem::with_id(app, "show", "Show NyanMate", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let assistant = MenuItem::with_id(app, "assistant", "Drop-a-File Assistant", true, None::<&str>)?;
            let agenda = MenuItem::with_id(app, "agenda", "Smart Agenda", true, None::<&str>)?;
            let reports = MenuItem::with_id(app, "reports", "Class Reports", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide NyanMate", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &settings, &assistant, &agenda, &reports, &hide, &quit])?;
            let mut tray = TrayIconBuilder::new().tooltip("NyanMate").menu(&menu).on_menu_event(|app, event| match event.id.as_ref() {
                "show" => { let _ = set_window_visible(app, "main", true); }
                "settings" => {
                    let _ = set_window_visible(app, "main", true);
                    let _ = app.emit_to("main", "open-pet-settings", ());
                }
                "assistant" => { let _ = set_window_visible(app, "assistant", true); }
                "agenda" => { let _ = set_window_visible(app, "agenda", true); }
                "reports" => { let _ = set_window_visible(app, "reports", true); }
                "hide" => { let _ = set_window_visible(app, "main", false); }
                "quit" => app.exit(0),
                _ => {}
            });
            if let Some(icon) = app.default_window_icon() { tray = tray.icon(icon.clone()); }
            tray.build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![companion_status, set_presenter_visible, set_reports_visible, set_agenda_visible, set_assistant_visible])
        .run(tauri::generate_context!())
        .expect("error while running NyanMate");
}
