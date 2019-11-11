<script>
import Checkmark from "./icons/Checkmark.svelte";

let activeTab = 'phone';
function changeTab(event){
/*     console.log(event.currentTarget.id) */
    activeTab = event.currentTarget.id;
    var els = document.querySelectorAll('.tab_active')
    function removeClasses() {
        for (var i = 0; i < els.length; i++) {
            els[i].classList.remove('tab_active')
        }
    }
    removeClasses();
    event.currentTarget.classList.add('tab_active')
}
</script>

<style>
.form_tab_wrapper{
    display:flex;
    flex-direction: row;
}
.form_tab{
    padding:5px;
    width:35px;
    height:35px;
}
.form_tab:hover{
    border: 2px solid #48afef; 
    border-radius: 50%;
}
.tab_active{
    border: 2px solid #48afef; 
    border-radius: 50%;
}
.svelte-form-input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 25px;
}
.svelte-form-label {
    font-size: 14px;
    color: #4a4a4a;
}
.svelte-form-input {
    padding: 5px 5px;
    font-size: 18px;
    line-height: 18px;
    border: 1px solid #00b52e;
    outline:none;
}
.svelte-form-submit {
    height: 50px;
    background: #e5ffee;
    border: 1px solid #00f956;
    color: #00862e;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bolder;
    letter-spacing: 1px;
}
.svelte-form-submit:disabled {
    opacity: 0.5;
}
.link {
    color: #006fff;
    text-decoration: none;
}


</style>

<h3>Оставьте заявку на обратный звонок и мы вам на него ответим</h3>

Выберите удобный способ связи:

<div class = 'form_tab_wrapper'>
    <div id='phone' class = 'form_tab tab_active'on:click={changeTab}><img src="img/contacts-icon-1.png" alt="Телефон"></div>
    <div id='email_form_tab' class = 'form_tab' on:click={changeTab}><img src="img/contacts-icon-2.png" alt="Email"></div>
    <div id='telegram' class = 'form_tab' on:click={changeTab}><img src="img/contacts-icon-3.png" alt="telegram"></div>
    <div id='vk' class = 'form_tab' on:click={changeTab}><img src="img/contacts-icon-4.png" alt="VK"></div>
    <div id='whatsapp' class = 'form_tab' on:click={changeTab}><img src="img/contacts-icon-5.png" alt="WhatsApp"></div>
    <div id='skype' class = 'form_tab' on:click={changeTab}><img src="img/contacts-icon-6.png" alt="Skype"></div>
</div>

{#if activeTab === 'phone'}
     <div class="svelte-form-input-group">
         <label class="svelte-form-label">Имя *</label>
         <input class="svelte-form-input"  name="name" placeholder='Иван'>
         <span class="svelte-form-message"></span>
     </div>
     <div class="svelte-form-input-group">
         <label class="svelte-form-label">Телефон *</label>
         <input class="svelte-form-input"  name="phone" placeholder='+7 (___)__-__-__'>
         <span class="svelte-form-message"></span>
     </div>
    <div class="svelte-form-input-group">
        <label class="svelte-form-label">
            <input type="checkbox" class="svelte-form-input">
            Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
        </label>

        <span class="svelte-form-message"></span>
    </div>
    <div class="svelte-form-input-group">
        <button class="svelte-form-submit" type="submit">
            <Checkmark/>
            Оставить заявку
        </button>
    </div>
{/if}
{#if activeTab === 'email_form_tab'}
<div class="svelte-form-input-group">
         <label class="svelte-form-label">Имя *</label>
         <input class="svelte-form-input"  name="name" placeholder='Иван'>
         <span class="svelte-form-message"></span>
     </div>
     <div class="svelte-form-input-group">
         <label class="svelte-form-label">E-mail *</label>
         <input class="svelte-form-input"  name="email" placeholder='ivan@gmail.com'>
         <span class="svelte-form-message"></span>
     </div>
    <div class="svelte-form-input-group">
        <label class="svelte-form-label">
            <input type="checkbox" class="svelte-form-input">
            Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
        </label>

        <span class="svelte-form-message"></span>
    </div>
    <div class="svelte-form-input-group">
        <button class="svelte-form-submit" type="submit">
            <Checkmark/>
            Оставить заявку
        </button>
    </div>
{/if}
{#if activeTab === 'telegram'}
    <div class="svelte-form-input-group">
             <label class="svelte-form-label">Имя *</label>
             <input class="svelte-form-input"  name="name" placeholder='Иван'>
             <span class="svelte-form-message"></span>
         </div>
         <div class="svelte-form-input-group">
             <label class="svelte-form-label">Ваш telegram *</label>
             <input class="svelte-form-input"  name="telegram" placeholder='@nickname'>
             <span class="svelte-form-message"></span>
         </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">
                <input type="checkbox" class="svelte-form-input">
                Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
            </label>

            <span class="svelte-form-message"></span>
        </div>
        <div class="svelte-form-input-group">
            <button class="svelte-form-submit" type="submit">
                <Checkmark/>
                Оставить заявку
            </button>
    </div>
{/if}

{#if activeTab === 'vk'}
    <div class="svelte-form-input-group">
             <label class="svelte-form-label">Имя *</label>
             <input class="svelte-form-input"  name="name" placeholder='Иван'>
             <span class="svelte-form-message"></span>
         </div>
         <div class="svelte-form-input-group">
             <label class="svelte-form-label">Ваш vk *</label>
             <input class="svelte-form-input"  name="vk" placeholder='id777666555'>
             <span class="svelte-form-message"></span>
         </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">
                <input type="checkbox" class="svelte-form-input">
                Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
            </label>
    
            <span class="svelte-form-message"></span>
        </div>
        <div class="svelte-form-input-group">
            <button class="svelte-form-submit" type="submit">
                <Checkmark/>
                Оставить заявку
            </button>
    </div>
{/if}

{#if activeTab === 'whatsapp'}
    <div class="svelte-form-input-group">
             <label class="svelte-form-label">Имя *</label>
             <input class="svelte-form-input"  name="name" placeholder='Иван'>
             <span class="svelte-form-message"></span>
         </div>
         <div class="svelte-form-input-group">
             <label class="svelte-form-label">Ваш WhatsApp *</label>
             <input class="svelte-form-input"  name="whatsapp" placeholder='+7 (___)__-__-__'>
             <span class="svelte-form-message"></span>
         </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">
                <input type="checkbox" class="svelte-form-input">
                Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
            </label>
    
            <span class="svelte-form-message"></span>
        </div>
        <div class="svelte-form-input-group">
            <button class="svelte-form-submit" type="submit">
                <Checkmark/>
                Оставить заявку
            </button>
    </div>
{/if}
{#if activeTab === 'skype'}
    <div class="svelte-form-input-group">
             <label class="svelte-form-label">Имя *</label>
             <input class="svelte-form-input"  name="name" placeholder='Иван'>
             <span class="svelte-form-message"></span>
         </div>
         <div class="svelte-form-input-group">
             <label class="svelte-form-label">Ваш Skype *</label>
             <input class="svelte-form-input"  name="skype" placeholder='ivan.denikin'>
             <span class="svelte-form-message"></span>
         </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">
                <input type="checkbox" class="svelte-form-input">
                Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
            </label>
    
            <span class="svelte-form-message"></span>
        </div>
        <div class="svelte-form-input-group">
            <button class="svelte-form-submit" type="submit">
                <Checkmark/>
                Оставить заявку
            </button>
    </div>
{/if}