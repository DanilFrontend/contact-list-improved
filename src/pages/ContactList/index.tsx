import ContactCard from "../../components/ContactCard";
import {Button, Center, Container, Group, Stack, Text, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {ContactScheme} from "../../types/contact.ts";
import AddEditContactModal, {ContactData} from "../../components/AddEditContactModal";
import {observer} from "mobx-react-lite";
import ContactsStore from "../../store/contacts-store.ts";
import {notifications} from "@mantine/notifications";
import AuthStore from '../../store/user-auth-store.ts'
import {modals} from "@mantine/modals";

const ContactListPage = observer(()  => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const {createContact, editContact, fetchContacts, contacts, deleteContact} = ContactsStore;
    const {logout} = AuthStore;
    useEffect(() => {
        fetchContacts()
    },[])
    const [currentContact, setCurrentContact] = useState<ContactScheme | null>(null);
    const handleEditContact = async (contact: ContactData & {id?:number}) => {
        try{
            if (!contact || !contact.id) return
            await editContact({...contact, id: contact!.id})
            setCurrentContact(null)
            setEditModalOpen(false)
        }catch (e){
            notifications.show({
                title: 'Ошибка',
                message: 'Ошибка при редактировании контакта!',
                color: 'red'
            })
        }
    };
    const handleCreateContact = async (contact: ContactData) => {
        try{
            if (!contact) return
            await createContact(contact)
            setCurrentContact(null)
            setAddModalOpen(false)
        }catch (e) {
            notifications.show({
                title: 'Ошибка',
                message: 'Ошибка при создании контакта!',
                color: 'red'
            })
        }
    }

    const handleDeleteContact = async (contactId: number) => {
        modals.openConfirmModal({
            title: 'Удаление контакта',
            centered: true,
            children: (
                <Text size="sm">
                    Вы уверены что хотите удалить контакт?
                </Text>
            ),
            labels: { confirm: 'Удалить', cancel: "Отмена" },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: () => deleteContact(contactId)
        });
    }
    const handleLogoutUser = () => {
        modals.openConfirmModal({
            title: 'Выход из аккаунта',
            centered: true,
            children: (
                <Text size="sm">
                    Вы уверены что хотите выйти из аккаунта?
                </Text>
            ),
            labels: { confirm: 'Выйти', cancel: "Отмена" },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: () => logout()
        });
    }
    return (
        <div>
            <AddEditContactModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleCreateContact} isEditModal={false}/>
            <AddEditContactModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} isEditModal onSubmit={handleEditContact} contact={currentContact}/>
            <Container size={'xl'}>
                <Group position={'apart'}>
                    <Title>Список контактов:</Title>
                    <Group>
                        <Button onClick={() => setAddModalOpen(true)} color={'green'}>Добавить контакт</Button>
                        <Button onClick={handleLogoutUser} color={'red'}>Выйти</Button>
                    </Group>
                </Group>
                {contacts.length !== 0
                    ?
                        <>
                            {contacts.map((obj) => (
                                <ContactCard data={obj}>
                                    <Stack>
                                        <Button onClick={() => {
                                            setEditModalOpen(true)
                                            setCurrentContact(obj)
                                        }}>Редактировать</Button>
                                        <Button color={'red'} onClick={() => handleDeleteContact(obj.id)}>Удалить</Button>
                                    </Stack>
                                </ContactCard>
                            ))}
                        </>
                    :
                        <Center mt={'10%'}><Title>Ваш список контактов пуст</Title></Center>}
            </Container>
        </div>
    );
})

export default ContactListPage;