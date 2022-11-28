// ---- Define your dialogs  and panels here ----
var instruction_panel = "<div><h1 style='color:rgb(221, 8, 8)'>START HERE- follow ALL instructions as listed</h1></div>";
var firstStep = "<p>1. Look at the END of the URL after 'tag=' to identify this task's name (i.e, add_new_user)</p>";
var secondStep = "<p>2. Click one of the 9 buttons below corresponding to the task name</p>";
var thirdStep = "<p>3. Take a picture of the instructions with your phone to reference later</p>";
var fourthStep = "<p>4. Follow the insructions accordingly, referencing your phone photo as needed</p>";
$('#sidepanel').append(instruction_panel);
$('#sidepanel').append(firstStep);
$('#sidepanel').append(secondStep);
$('#sidepanel').append(thirdStep);
$('#sidepanel').append(fourthStep);

var instructions = "<br><button class='accordion'>remove_direct_permission</button><div class='panel'><p><ol><li>Click Edit Permissions for important_file.txt </li> <li>Select employee 3 at the top </li> <li>Deny write and modify permissions </li><li>Click OK</li></ol></p></div><button class='accordion'>add_new_user</button><div class='panel'><ol><li>Go to edit presentation_documents, click the add button and select employee 4</li><li> Make sure employee 4 is selected </li><li>Check permissions of read, write, and modify</li> <li> Click OK </li></ol></div><button class='accordion'>add_full_permissions</button><div class='panel'><ol><li>Click into presentation_documents</li><li>Click the Add button and select new_manager and click 'OK'</li><li>Select new_manager and check full control in permissions</li></ol></div><button class = 'accordion'>remove_inherited_permission</button><div class='panel'><ol> <li>Go into the important_files.txt </li> <li>Select Employee 3</li> <li>Deny write and modify permissions </li> <li> Click OK </li> </ol></div><button class='accordion'>intern_permissions</button><div class='panel'><ol><li>Go into intern subproject and click intern</li><li>Check write allow </li><li>Click OK</li></ol></div><button class='accordion'>remove_user_with_inheritance</button><div class='panel'><p><ol><li>Click into important files.txt</li><li>Select Employee 3 and check deny for all permissions</li> <li>Click OKs</li></ol></p></div><button class='accordion'>restrict_group_member</button><div class='panel'><ol><li>Click on 'Edit Permissions' next to 'important_file.txt'</li><li>Select 'employees', click 'Remove', and click 'yes'</li><li>Click on 'Add..' and select 'employee1' and click 'OK'</li><li>Select 'employee1' and click the allow check boxes for read, write, and modify</li><li>Click on 'Add..' and select 'employee2' and click 'OK'</li><li>Select 'employee2' and click the allow check boxes for read, write, and modify</li><li>Click on 'Add..' and select 'employee3' and click 'OK'</li><li>Select 'employee3' and click the allow check box ONLY for read </li></ol></div><button class='accordion'>let_ta_modify</button><div class='panel'><ol><li>Click on 'Edit Permissions' next to 'Lecture Notes'</li><li>Click on 'more' on the bottom right</li><li>Click on the 2nd check box: 'Apply same permissions to all files within this folder'</li><li>Click on 'yes' and you're done</li></ol></div><button class='accordion'>lost_inheritance</button><div class='panel'><ol><li>Click on 'edit permissions' next to 'Lecture Notes'.</li><li>Click on 'more' on the bottom right corner of the pop up.</li><li>Click the 2nd check box: 'Apply same permissions to all files within this folder'</li><li>Click 'yes', and you're done</li></ol></div>";
$('#sidepanel').append(instructions);



var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}




// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" title="click me" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                    Edit Permissions 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" title="click me" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                Edit Permissions
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 