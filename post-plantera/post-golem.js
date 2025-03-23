document.addEventListener("DOMContentLoaded", function () {
    let bossCheckboxes = document.querySelectorAll(".boss-checkbox");

    bossCheckboxes.forEach((checkbox) => {
        let bossId = checkbox.id;
        let checklistItems = document.querySelectorAll(`.task[data-boss="${bossId}"]`);

        checklistItems.forEach((item) => {
            item.disabled = true; // Initially disable all checkboxes
            item.addEventListener("change", function () {
                checkItems(bossId);
            });
        });

        checkbox.addEventListener("change", function () {
            unlockNextBoss();
        });
    });

    unlockNextBoss(); // Ensure initial state is correct
});

// Modify your toggleDropdown function to properly initialize items when opening
function toggleDropdown(id) {
    let dropdown = document.getElementById(id);
    let isOpening = dropdown.style.display === "none";
    
    dropdown.style.display = isOpening ? "block" : "none";
    
    if (isOpening) {
        // Get the boss container
        let bossContainer = dropdown.closest('.boss');
        
        // Only run this for unlocked bosses
        if (!bossContainer.classList.contains('locked')) {
            // Check if any armor or weapon is already selected
            let selectedArmorOrWeapon = bossContainer.querySelector('.armor-checkbox[data-selected="true"], .weapon-checkbox[data-selected="true"]');
            
            if (selectedArmorOrWeapon) {
                // If an item is already selected, just refresh its state
                handleArmorSelection(selectedArmorOrWeapon);
            } else {
                // No selection yet, initialize all armor and weapons as available
                let allArmorCheckboxes = bossContainer.querySelectorAll('.armor-checkbox');
                let allWeaponCheckboxes = bossContainer.querySelectorAll('.weapon-checkbox');
                
                // Enable all armor choices
                allArmorCheckboxes.forEach(armor => {
                    armor.disabled = false;
                    armor.parentNode.style.opacity = "1";
                    armor.parentNode.style.textDecoration = "none";
                    armor.parentNode.style.color = "white";
                });
                
                // Enable all weapon choices
                allWeaponCheckboxes.forEach(weapon => {
                    weapon.disabled = false;
                    weapon.parentNode.style.opacity = "1";
                    weapon.parentNode.style.textDecoration = "none";
                    weapon.parentNode.style.color = "white";
                });
                
                // Disable accessories until a class is chosen
                let allAccessories = bossContainer.querySelectorAll('.accessory-checkbox');
                allAccessories.forEach(acc => {
                    acc.disabled = true;
                    acc.parentNode.style.opacity = "0.5";
                    acc.parentNode.style.textDecoration = "line-through";
                    acc.parentNode.style.color = "#ff7777";
                });
                
                // Disable general items until a class is chosen
                let generalItems = bossContainer.querySelectorAll('.task:not(.armor-checkbox):not(.accessory-checkbox):not(.weapon-checkbox):not(.boss-checkbox)');
                generalItems.forEach(item => {
                    item.disabled = true;
                    item.parentNode.style.opacity = "0.5";
                    item.parentNode.style.textDecoration = "line-through";
                    item.parentNode.style.color = "#ff7777";
                });
            }
        }
    }
}


function unlockNextBoss() {
    let bosses = document.querySelectorAll(".boss");
    
    // First boss is always enabled
    if (bosses.length > 0) {
        bosses[0].classList.remove("locked");
        let firstBossCheckbox = bosses[0].querySelector(".boss-checkbox");
        if (firstBossCheckbox) {
            firstBossCheckbox.disabled = false;
            
            // Enable armor checkboxes for first boss
            let firstBossArmor = bosses[0].querySelectorAll(".armor-checkbox");
            firstBossArmor.forEach(armor => {
                armor.disabled = false;
            });
        }
    }
    
    // Process remaining bosses in sequence
    for (let i = 0; i < bosses.length - 1; i++) {
        let currentBoss = bosses[i];
        let currentBossCheckbox = currentBoss.querySelector(".boss-checkbox");
        let nextBoss = bosses[i + 1];
        
        if (currentBossCheckbox && currentBossCheckbox.checked) {
            // Enable the next boss
            nextBoss.classList.remove("locked");
            let nextBossCheckbox = nextBoss.querySelector(".boss-checkbox");
            nextBossCheckbox.disabled = false;
            
            // Enable armor checkboxes for the next boss
            let nextBossId = nextBoss.id;
            let armorCheckboxes = nextBoss.querySelectorAll(".armor-checkbox");
            armorCheckboxes.forEach(armor => {
                armor.disabled = false;
                armor.setAttribute("data-boss", nextBossId); // Make sure data-boss is correct
            });
            
            // Special case for "OR" path (Eater of Worlds OR Brain of Cthulhu)
            if (currentBoss.id === "boss2" && document.querySelector('.or-separator')) {
                // If we're at Eye of Cthulhu (boss2), enable both boss3 and boss4
                let orBosses = [bosses[2], bosses[3]]; // Assuming boss3 and boss4 are the OR options
                
                orBosses.forEach(orBoss => {
                    orBoss.classList.remove("locked");
                    let orBossCheckbox = orBoss.querySelector(".boss-checkbox");
                    orBossCheckbox.disabled = false;
                    
                    // Enable armor checkboxes
                    let orBossId = orBoss.id;
                    let armorCheckboxes = orBoss.querySelectorAll(".armor-checkbox");
                    armorCheckboxes.forEach(armor => {
                        armor.disabled = false;
                        armor.setAttribute("data-boss", orBossId);
                    });
                });
            }
        } else {
            // If current boss is not completed, lock all subsequent bosses
            for (let j = i + 1; j < bosses.length; j++) {
                bosses[j].classList.add("locked");
                let bossCheckbox = bosses[j].querySelector(".boss-checkbox");
                if (bossCheckbox) {
                    bossCheckbox.disabled = true;
                    bossCheckbox.checked = false;
                }
                
                // Disable and uncheck all checkboxes in locked bosses
                let allCheckboxes = bosses[j].querySelectorAll(".task");
                allCheckboxes.forEach(checkbox => {
                    checkbox.disabled = true;
                    checkbox.checked = false;
                });
                
                // Hide any open dropdown menus on locked bosses
                let dropdown = bosses[j].querySelector(".items");
                if (dropdown) {
                    dropdown.classList.remove("show");
                    dropdown.style.display = "none";
                }
                
                // Make sure the boss button is effectively disabled
                let bossButton = bosses[j].querySelector("button");
                if (bossButton) {
                    bossButton.style.pointerEvents = "none";
                }
            }
            // Exit the loop once we find the first incomplete boss
            break;
        }
    }
    
    // Make sure locked bosses have their buttons disabled
    document.querySelectorAll('.boss.locked button').forEach(button => {
        button.style.pointerEvents = "none";
    });
    
    // Make sure unlocked bosses have their buttons enabled
    document.querySelectorAll('.boss:not(.locked) button').forEach(button => {
        button.style.pointerEvents = "auto";
    });
}
function checkItems(bossId) {
    // Get the correct boss element
    let boss = document.getElementById(bossId) || document.querySelector(`[data-boss="${bossId}"]`);
    if (!boss) return; // Exit if boss element not found
    
    // Find the correct boss checkbox
    let bossCheckbox = boss.querySelector(".boss-checkbox") || document.querySelector(`#${bossId}`);
    if (!bossCheckbox) return; // Exit if checkbox not found
    
    let allTasks = document.querySelectorAll(`.task[data-boss="${bossId}"]`);
    
    // Check if all enabled checkboxes are checked
    let allChecked = Array.from(allTasks).filter(item => !item.disabled).every(item => item.checked);
    
    if (allChecked && allTasks.length > 0) {
        console.log(`All tasks for ${bossId} are checked!`);
        bossCheckbox.checked = true;
        bossCheckbox.disabled = false;
        
        // Explicitly trigger the change event
        let event = new Event("change", { bubbles: true });
        bossCheckbox.dispatchEvent(event);
        
        // Call unlockNextBoss directly to ensure it runs
        unlockNextBoss();
        
        // Close dropdown automatically if it exists
        let dropdown = boss.querySelector(".items");
        if (dropdown) dropdown.style.display = "none";
    }
}

// Add this to your existing code to prevent clicks on locked bosses
document.querySelectorAll('.boss button').forEach(button => {
    button.addEventListener('click', (event) => {
        // Check if the boss is locked before showing the menu
        const bossElement = event.target.closest('.boss');
        if (bossElement.classList.contains('locked')) {
            // Prevent the click on locked bosses
            return;
        }
        
        const menu = event.target.nextElementSibling;
        menu.classList.toggle('show');

        // Adjust position if too close to screen edges
        const rect = menu.getBoundingClientRect();
        if (rect.left < 0) {
            menu.style.left = '10px';
            menu.style.transform = 'none';
        } else if (rect.right > window.innerWidth) {
            menu.style.left = 'auto';
            menu.style.right = '10px';
            menu.style.transform = 'none';
        }
    });
});

function handleArmorSelection(checkbox) {
    // Get the boss container
    let bossContainer = checkbox.closest(".boss");
    let bossId = bossContainer.id;
    
    // If this is an armor or weapon checkbox being selected
    if ((checkbox.classList.contains("armor-checkbox") || checkbox.classList.contains("weapon-checkbox")) && checkbox.checked) {
        // Get the class from the selected checkbox
        let itemClass = checkbox.getAttribute("data-class");
        let selectedClass = itemClass.split("-")[1]; // Extract "melee", "mage", etc.
        
        // Mark this checkbox as selected
        checkbox.setAttribute('data-selected', 'true');
        
        // Find all class-specific items in the same boss container
        let allArmorCheckboxes = bossContainer.querySelectorAll(".armor-checkbox");
        let allWeaponCheckboxes = bossContainer.querySelectorAll(".weapon-checkbox");
        
        // Process all armor items
        allArmorCheckboxes.forEach(armor => {
            let armorClass = armor.getAttribute("data-class");
            if (armorClass === itemClass) {
                // Same class - keep enabled
                armor.disabled = false;
                armor.parentNode.style.opacity = "1";
                armor.parentNode.style.textDecoration = "none";
                armor.parentNode.style.color = "white";
            } else {
                // Different class - disable
                armor.disabled = true;
                armor.parentNode.style.opacity = "0.5";
                armor.parentNode.style.color = "#ff7777";
                armor.parentNode.style.textDecoration = "line-through";
            }
        });
        
        // Process all weapon items 
        allWeaponCheckboxes.forEach(weapon => {
            let weaponClass = weapon.getAttribute("data-class");
            if (weaponClass === itemClass) {
                // Same class - keep enabled
                weapon.disabled = false;
                weapon.parentNode.style.opacity = "1";
                weapon.parentNode.style.textDecoration = "none";
                weapon.parentNode.style.color = "white";
            } else {
                // Different class - disable
                weapon.disabled = true;
                weapon.parentNode.style.opacity = "0.5";
                weapon.parentNode.style.color = "#ff7777";
                weapon.parentNode.style.textDecoration = "line-through";
            }
        });
        
        // Enable only matching class accessories
        let matchingAccessories = bossContainer.querySelectorAll(`.accessory-checkbox[data-class="accessory-${selectedClass}"]`);
        let allAccessories = bossContainer.querySelectorAll(".accessory-checkbox");
        
        // First disable all accessories
        allAccessories.forEach(acc => {
            acc.disabled = true;
            acc.parentNode.style.opacity = "0.5";
            acc.parentNode.style.textDecoration = "line-through";
            acc.parentNode.style.color = "#ff7777";
        });
        
        // Then enable matching ones
        matchingAccessories.forEach(acc => {
            acc.disabled = false;
            acc.parentNode.style.opacity = "1";
            acc.parentNode.style.textDecoration = "none";
            acc.parentNode.style.color = "white";
        });
        
        // IMPORTANT: Enable all general items automatically when armor/weapon is selected
        // This ensures consistent behavior across all bosses
        let generalItems = bossContainer.querySelectorAll(".task:not(.armor-checkbox):not(.accessory-checkbox):not(.weapon-checkbox):not(.boss-checkbox)");
        generalItems.forEach(item => {
            item.disabled = false;
            item.parentNode.style.opacity = "1";
            item.parentNode.style.textDecoration = "none";
            item.parentNode.style.color = "white";
        });
    }
    
    // Rest of function remains the same
    // ...
    
    // Check if all required items are selected to update boss status
    checkItems(bossId);
}
function resetBoss(bossId) {
    // Find the actual boss ID from the button's parent
    let bossContainer = event.target.closest('.boss');
    let actualBossId = bossContainer.id;
    
    // Get all checkboxes in this boss container
    let allCheckboxes = bossContainer.querySelectorAll('input[type="checkbox"]');
    
    // Uncheck all checkboxes (except the boss checkbox itself)
    allCheckboxes.forEach(checkbox => {
        if (!checkbox.classList.contains('boss-checkbox')) {
            checkbox.checked = false;
        }
    });
    
    // Reset armor and weapon selection state
    let allArmorCheckboxes = bossContainer.querySelectorAll('.armor-checkbox');
    let allWeaponCheckboxes = bossContainer.querySelectorAll('.weapon-checkbox');
    
    // Enable all armor options
    allArmorCheckboxes.forEach(armor => {
        armor.disabled = false;
        armor.parentNode.style.opacity = "1";
        armor.parentNode.style.textDecoration = "none";
        armor.parentNode.style.color = "white";
    });
    
    // Enable all weapon options
    allWeaponCheckboxes.forEach(weapon => {
        weapon.disabled = false;
        weapon.parentNode.style.opacity = "1";
        weapon.parentNode.style.textDecoration = "none";
        weapon.parentNode.style.color = "white";
    });
    
    // Disable all accessories initially
    let allAccessories = bossContainer.querySelectorAll('.accessory-checkbox');
    allAccessories.forEach(acc => {
        acc.disabled = true;
        acc.checked = false;
        acc.parentNode.style.opacity = "0.5";
        acc.parentNode.style.textDecoration = "line-through";
        acc.parentNode.style.color = "#ff7777";
    });
    
    // Disable all general items initially
    let generalItems = bossContainer.querySelectorAll('.task:not(.armor-checkbox):not(.accessory-checkbox):not(.weapon-checkbox)');
    generalItems.forEach(item => {
        if (!item.classList.contains('boss-checkbox')) {
            item.disabled = true;
            item.checked = false;
            item.parentNode.style.opacity = "0.5";
            item.parentNode.style.textDecoration = "line-through";
            item.parentNode.style.color = "#ff7777";
        }
    });
    
    // Clear any lingering states
    bossContainer.querySelectorAll('.task').forEach(item => {
        if (!item.classList.contains('boss-checkbox')) {
            item.setAttribute('data-selected', 'false');
        }
    });
    
    // Ensure the boss checkbox state is correct
    let bossCheckbox = bossContainer.querySelector('.boss-checkbox');
    if (bossCheckbox) {
        bossCheckbox.checked = false;
    }
    
    // Check if this affects the boss completion status
    checkItems(actualBossId);
}