#[tauri::command]
fn companion_status() -> &'static str {
    "NyanMate is awake"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![companion_status])
        .run(tauri::generate_context!())
        .expect("error while running NyanMate");
}
