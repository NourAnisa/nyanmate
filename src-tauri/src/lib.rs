use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};

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
            let show = MenuItem::with_id(app, "show", "Show NyanMate", true, None::<&str>)?;
            let assistant = MenuItem::with_id(app, "assistant", "Drop-a-File Assistant", true, None::<&str>)?;
            let agenda = MenuItem::with_id(app, "agenda", "Smart Agenda", true, None::<&str>)?;
            let reports = MenuItem::with_id(app, "reports", "Class Reports", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide NyanMate", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &assistant, &agenda, &reports, &hide, &quit])?;
            let mut tray = TrayIconBuilder::new().tooltip("NyanMate").menu(&menu).on_menu_event(|app, event| match event.id.as_ref() {
                "show" => { let _ = set_window_visible(app, "main", true); }
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
