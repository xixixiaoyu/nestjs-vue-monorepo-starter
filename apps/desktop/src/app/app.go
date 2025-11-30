package app

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// OnStartup is called when the app starts up.
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
}

// OnDomReady is called after the front-end resources have been loaded
func (a *App) OnDomReady(ctx context.Context) {
	// Here you can make your front-end interact with the backend
}

// OnBeforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) OnBeforeClose(ctx context.Context) (prevent bool) {
	return false
}

// OnShutdown is called when the application is shutting down
func (a *App) OnShutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello, %s!", name)
}

// GetAppInfo returns basic app information
func (a *App) GetAppInfo() map[string]interface{} {
	return map[string]interface{}{
		"name":     "Desktop App",
		"version":  "0.1.0",
		"platform": "desktop",
	}
}

// ShowNotification shows a desktop notification
func (a *App) ShowNotification(title, body string) {
	runtime.EventsEmit(a.ctx, "notification", map[string]string{
		"title": title,
		"body":  body,
	})
}
