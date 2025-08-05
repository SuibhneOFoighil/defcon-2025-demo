package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"strings"
)

func main() {
	urlFlag := flag.String("url", "", "URL to open in Chromium (required)")
	noSecurityFlag := flag.Bool("no-security", false, "Open Chromium with --disable-web-security")
	flag.Parse()

	if *urlFlag == "" {
		log.Fatal("--url argument is required")
	}

	http.HandleFunc("/reset", func(w http.ResponseWriter, r *http.Request) {
		log.Println("/reset endpoint called")
		userParam := r.URL.Query().Get("user")
		currentUser, err := user.Current()
		if err != nil {
			log.Printf("Failed to get current user: %v", err)
			http.Error(w, "Failed to get current user", http.StatusInternalServerError)
			return
		}
		username := currentUser.Username
		if userParam != "" {
			log.Printf("Overriding username with user param: %s", userParam)
			username = userParam // Allow override for testing, but not recommended for prod
		}

		// 1. Kill all running Chromium instances
		log.Println("Killing all running Chromium instances...")
		if err := killChromium(); err != nil {
			log.Printf("Failed to kill Chromium: %v", err)
		} else {
			log.Println("Successfully killed Chromium processes (if any)")
		}

		// 2. Delete specified files/directories
		paths := []string{
			fmt.Sprintf("/home/%s/snap/chromium/common/chromium/Default/History", username),
			fmt.Sprintf("/home/%s/snap/chromium/common/chromium/Default/History-journal", username),
			fmt.Sprintf("/home/%s/snap/chromium/common/chromium/Default/Cache", username),
			fmt.Sprintf("/home/%s/snap/chromium/common/chromium/Default/Sessions", username),
			"/tmp/chromium",
		}
		for _, p := range paths {
			log.Printf("Attempting to remove: %s", p)
			if err := os.RemoveAll(p); err != nil {
				log.Printf("Failed to remove %s: %v", p, err)
			} else {
				log.Printf("Successfully removed: %s", p)
			}
		}

		// 3. Relaunch Chromium
		if err := launchChromium(*urlFlag, *noSecurityFlag); err != nil {
			log.Printf("Failed to start Chromium: %v", err)
			http.Error(w, "Failed to start Chromium", http.StatusInternalServerError)
			return
		}
		log.Println("Chromium launched successfully.")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "Chromium reset and launched.")
	})

	// Launch Chromium on server start
	if err := launchChromium(*urlFlag, *noSecurityFlag); err != nil {
		log.Printf("Failed to start Chromium on server start: %v", err)
	} else {
		log.Println("Chromium launched successfully on server start.")
	}

	log.Println("Server starting on 0.0.0.0:8080 (IPv4 only)...")
	if err := http.ListenAndServe("0.0.0.0:8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func launchChromium(url string, noSecurity bool) error {
	args := []string{url}
	if noSecurity {
		args = append([]string{"--disable-web-security", "--user-data-dir=/tmp/chromium", "--test-type", "--hide-crash-restore-bubble", "--start-maximized"}, args...)
		log.Println("Launching Chromium with --disable-web-security")
	} else {
		log.Println("Launching Chromium without --disable-web-security")
	}
	log.Printf("Launching Chromium with args: %v", args)
	cmd := exec.Command("chromium", args...)
	if err := cmd.Start(); err != nil {
		return err
	}

	// // After 3 seconds, send F11 to Chromium to make it fullscreen
	// go func() {
	// 	log.Println("Waiting 3 seconds before sending F11 to Chromium...")
	// 	time.Sleep(3 * time.Second)
	// 	// Use xdotool to find Chromium window and send F11
	// 	winCmd := exec.Command("xdotool", "search", "--sync", "--onlyvisible", "--class", "chromium")
	// 	output, err := winCmd.Output()
	// 	if err != nil {
	// 		log.Printf("Failed to find Chromium window for F11: %v", err)
	// 		return
	// 	}
	// 	windowIDs := strings.Fields(string(output))
	// 	if len(windowIDs) == 0 {
	// 		log.Printf("No Chromium window found for F11")
	// 		return
	// 	}
	// 	for _, winID := range windowIDs {
	// 		log.Printf("Sending F11 to Chromium window ID: %s", winID)
	// 		keyCmd := exec.Command("xdotool", "key", "--window", winID, "F11")
	// 		if err := keyCmd.Run(); err != nil {
	// 			log.Printf("Failed to send F11 to window %s: %v", winID, err)
	// 		} else {
	// 			log.Printf("F11 sent to window %s", winID)
	// 		}
	// 	}
	// }()

	return nil
}

func killChromium() error {
	// Try killing by process name (Linux)
	cmd := exec.Command("pkill", "-9", "chrome")
	output, err := cmd.CombinedOutput()
	if err != nil && !strings.Contains(string(output), "no process found") {
		return fmt.Errorf("pkill error: %v, output: %s", err, output)
	}
	return nil
}
